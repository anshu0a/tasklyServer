const isNewDay = function (last) {
    const now = new Date();
    return !last ||
        now.getFullYear() !== last.getFullYear() ||
        now.getMonth() !== last.getMonth() ||
        now.getDate() !== last.getDate();
}

module.exports = {
  isNewDay
};