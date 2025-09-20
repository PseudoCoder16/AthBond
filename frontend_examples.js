
// Frontend Integration Examples for EthBond

// 1. Upload Video
async function uploadVideo(videoFile, username = 'Anonymous') {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('username', username);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Video uploaded and analyzed:', result.results);
            return result;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

// 2. Get User Progress
async function getUserProgress(userId) {
    try {
        const response = await fetch(`/api/user/${userId}/progress`);
        const result = await response.json();
        
        if (result.success) {
            return formatProgressData(result.progress);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to get progress:', error);
        throw error;
    }
}

// 3. Get Leaderboard
async function getLeaderboard(limit = 50) {
    try {
        const response = await fetch(`/api/leaderboard?limit=${limit}`);
        const result = await response.json();
        
        if (result.success) {
            return formatLeaderboardData(result);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to get leaderboard:', error);
        throw error;
    }
}

// 4. Format Progress Data for UI
function formatProgressData(progressData) {
    if (!progressData) {
        return {
            videosAnalyzed: 0,
            averagePerformance: 0,
            improvement: 0,
            badges: []
        };
    }
    
    return {
        videosAnalyzed: progressData.total_videos || 0,
        averagePerformance: progressData.average_performance || 0,
        improvement: progressData.improvement || 0,
        badges: formatBadgesForUI(progressData.badges || [])
    };
}

// 5. Format Badges for UI
function formatBadgesForUI(badges) {
    return badges.map(badge => ({
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        earned: badge.earned || false,
        level: badge.level || 'locked',
        color: getBadgeColor(badge.level || 'locked')
    }));
}

// 6. Get Badge Color
function getBadgeColor(level) {
    const colorMap = {
        'gold': '#FFD700',
        'silver': '#C0C0C0',
        'bronze': '#CD7F32',
        'locked': '#808080'
    };
    return colorMap[level] || '#808080';
}

// 7. React Component Example
function ProgressDashboard({ userId }) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchProgress() {
            try {
                const progressData = await getUserProgress(userId);
                setProgress(progressData);
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchProgress();
    }, [userId]);
    
    if (loading) return <div>Loading...</div>;
    if (!progress) return <div>No progress data available</div>;
    
    return (
        <div className="progress-dashboard">
            <div className="stats">
                <div className="stat">
                    <h3>{progress.videosAnalyzed}</h3>
                    <p>Videos Analyzed</p>
                </div>
                <div className="stat">
                    <h3>{progress.averagePerformance}%</h3>
                    <p>Average Performance</p>
                </div>
                <div className="stat">
                    <h3>+{progress.improvement}%</h3>
                    <p>Improvement</p>
                </div>
            </div>
            
            <div className="badges">
                {progress.badges.map(badge => (
                    <div 
                        key={badge.name} 
                        className={`badge ${badge.earned ? 'earned' : 'locked'}`}
                        style={{ borderColor: badge.color }}
                    >
                        <span className="badge-icon">{badge.icon}</span>
                        <span className="badge-name">{badge.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
