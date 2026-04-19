import os
from pathlib import Path
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings


class RAGCoachService:
    def __init__(self) -> None:
        self.base_path = Path(__file__).resolve().parent.parent
        self.index_path = self.base_path / "data" / "coach_index"
        self.index_path.mkdir(parents=True, exist_ok=True)
        self.vectorstore = self._load_vectorstore()
        self.embeddings_available = self.vectorstore is not None

    def _get_embeddings(self):
        if os.getenv("OPENAI_API_KEY"):
            return OpenAIEmbeddings()
        try:
            return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        except Exception:
            return None

    def _load_vectorstore(self):
        embeddings = self._get_embeddings()
        if embeddings is None:
            return None
        faiss_index = self.index_path / "index.faiss"
        if faiss_index.exists():
            return FAISS.load_local(
                str(self.index_path), embeddings=embeddings, allow_dangerous_deserialization=True
            )
        return None

    def _load_document(self, file_path: str):
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            return PyPDFLoader(file_path).load()
        if ext in [".docx", ".doc"]:
            return Docx2txtLoader(file_path).load()
        return TextLoader(file_path, encoding="utf-8").load()

    def ingest(self, file_path: str) -> dict:
        embeddings = self._get_embeddings()
        if embeddings is None:
            return {
                "chunks_indexed": 0,
                "index_path": str(self.index_path),
                "warning": "Embeddings backend unavailable. Install sentence-transformers or set OPENAI_API_KEY."
            }

        docs = self._load_document(file_path)
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        chunks = splitter.split_documents(docs)

        if self.vectorstore is None:
            self.vectorstore = FAISS.from_documents(chunks, embeddings)
        else:
            self.vectorstore.add_documents(chunks)

        self.vectorstore.save_local(str(self.index_path))
        return {"chunks_indexed": len(chunks), "index_path": str(self.index_path)}

    def query(self, question: str) -> dict:
        if self.vectorstore is None:
            return {
                "answer": "No indexed coaching context available yet. Upload documents after enabling embeddings backend.",
                "sources": []
            }

        docs = self.vectorstore.similarity_search(question, k=4)
        context = "\n\n".join([d.page_content for d in docs])
        prompt = (
            "You are an elite sports AI coach. Use only context below to answer.\n"
            f"Context:\n{context}\n\nQuestion: {question}\nAnswer:"
        )

        if os.getenv("OPENAI_API_KEY"):
            llm = ChatOpenAI(model=os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini"), temperature=0.2)
            response = llm.invoke(prompt).content
        else:
            # Lightweight fallback when no hosted LLM key is configured.
            response = "Context-based summary:\n" + "\n".join(
                [f"- {chunk.page_content[:180]}..." for chunk in docs]
            )

        return {
            "answer": response,
            "sources": [d.metadata.get("source", "unknown") for d in docs]
        }
