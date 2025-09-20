const fs = require('fs');
const path = require('path');

// Data storage configuration
const DATA_DIR = path.join(__dirname, '../../');
const ATHLETES_FILE = path.join(DATA_DIR, 'athletes.json');
const COACHES_FILE = path.join(DATA_DIR, 'coaches.json');

// Initialize data files if they don't exist
const initializeDataFiles = () => {
    if (!fs.existsSync(ATHLETES_FILE)) {
        fs.writeFileSync(ATHLETES_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(COACHES_FILE)) {
        fs.writeFileSync(COACHES_FILE, JSON.stringify([], null, 2));
    }
};

// Helper functions for athletes
const readAthletes = () => {
    try {
        const data = fs.readFileSync(ATHLETES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading athletes file:', error);
        return [];
    }
};

const writeAthletes = (athletes) => {
    try {
        fs.writeFileSync(ATHLETES_FILE, JSON.stringify(athletes, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing athletes file:', error);
        return false;
    }
};

const findAthleteByEmail = (email) => {
    const athletes = readAthletes();
    return athletes.find(athlete => athlete.email === email);
};

const findAthleteById = (id) => {
    const athletes = readAthletes();
    return athletes.find(athlete => athlete.id === id);
};

// Helper functions for coaches
const readCoaches = () => {
    try {
        const data = fs.readFileSync(COACHES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading coaches file:', error);
        return [];
    }
};

const writeCoaches = (coaches) => {
    try {
        fs.writeFileSync(COACHES_FILE, JSON.stringify(coaches, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing coaches file:', error);
        return false;
    }
};

const findCoachByEmail = (email) => {
    const coaches = readCoaches();
    return coaches.find(coach => coach.email === email);
};

const findCoachById = (id) => {
    const coaches = readCoaches();
    return coaches.find(coach => coach.id === id);
};

module.exports = {
    initializeDataFiles,
    // Athletes
    readAthletes,
    writeAthletes,
    findAthleteByEmail,
    findAthleteById,
    // Coaches
    readCoaches,
    writeCoaches,
    findCoachByEmail,
    findCoachById
};
