// OnlineBackend.js - Stub for the online level backend.
//
// The original Flash game used PHP endpoints in misc/web/:
//   getbyid.php, getbyname.php, getmostplayed.php, getnumlevels.php,
//   getrandomid.php, getrecent.php, submit.php, submitreview.php,
//   updateplaycount.php
//
// These require a server with MySQL. For the web port, this module provides
// the same API as async JS methods. Currently stubbed to return empty data.
// TODO: Implement real backend (REST API + database) when online features
// are prioritized.
//
// Usage:
//   import OnlineBackend from '../backend/OnlineBackend.js';
//   const levels = await OnlineBackend.getRecent(0);

class OnlineBackend {
    static _warn(method) {
        console.warn(`[OnlineBackend] ${method} is stubbed - no backend configured`);
    }

    // Mirrors getrecent.php - returns recent levels, 5 per page.
    // Original params: offset. Returns XML <levellist> with <level> entries.
    static async getRecent(offset = 0) {
        this._warn('getRecent');
        // TODO: Fetch from real backend.
        // Expected format: [{id, level_name, creator_name, date_created, playcount, ratingavg, ratingcount}, ...]
        return [];
    }

    // Mirrors getmostplayed.php - returns most-played levels.
    static async getMostPlayed(offset = 0) {
        this._warn('getMostPlayed');
        return [];
    }

    // Mirrors getbyname.php - search levels by name.
    static async getByName(name, offset = 0) {
        this._warn('getByName');
        return [];
    }

    // Mirrors getbyid.php - get a single level by ID.
    // Returns: {id, level_name, creator_name, level_data (XML string), ...} or null.
    static async getById(id) {
        this._warn('getById');
        return null;
    }

    // Mirrors getrandomid.php - get a random level ID.
    static async getRandomId() {
        this._warn('getRandomId');
        return null;
    }

    // Mirrors getnumlevels.php - get total level count.
    static async getNumLevels() {
        this._warn('getNumLevels');
        return 0;
    }

    // Mirrors submit.php - submit a new level.
    // Params: {name, creator, levelXml, ...}
    // Returns: {success: bool, id: number} 
    static async submitLevel(data) {
        this._warn('submitLevel');
        // TODO: POST to real backend.
        return { success: false, error: 'Backend not implemented' };
    }

    // Mirrors submitreview.php - submit a rating/review for a level.
    // Params: {levelId, rating, review}
    static async submitReview(levelId, rating, review = '') {
        this._warn('submitReview');
        return { success: false, error: 'Backend not implemented' };
    }

    // Mirrors updateplaycount.php - increment play count for a level.
    static async updatePlayCount(levelId) {
        this._warn('updatePlayCount');
        // Fire-and-forget in original; no return value needed.
        return;
    }
}

export default OnlineBackend;
