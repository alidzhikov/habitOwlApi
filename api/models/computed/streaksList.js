const habit = require('../habit');

class Streak {
    constructor(habitId, startDate, endDate, streak) {
        this.id = `habitId-${extractDate(startDate)}`;
        this.habitId = habitId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.streak = streak || 2;
        this.hasEnded = false;
    }

    incrementStreak(incrementAmount, nowEntryDate) {
        this.streak += incrementAmount;
        this.endDate = nowEntryDate;
    }

    endStreak(nowEntryDate) {
        //this.incrementStreak(1);
        this.endDate = nowEntryDate;
        this.hasEnded = true;
    }
}

function extractDate(datetimeObject) {
    if (!datetimeObject) return ''
    const year = datetimeObject.getFullYear();
    const month = datetimeObject.getMonth() + 1;
    const day = datetimeObject.getDate();

    // Creating a string representation of the date in the format "YYYY-MM-DD"
    return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

}

class StreaksList {
    constructor(habitId, speed) {
        this.habitId = habitId;
        this.streaks = [];
        this.speed = speed;
    }

    update(previousEntry, entry) {
        if (!previousEntry || !entry) return;
        const prevEntryDate = previousEntry.date;
        const nowEntryDate = entry.date;
        const difference = this.differenceBetweenDays(prevEntryDate, nowEntryDate);

        if (!prevEntryDate || !difference || !nowEntryDate) {
            return;
        }

        const isFutureDay = this.differenceBetweenDays(nowEntryDate, Date.now()) < 0;

        if (!isFutureDay && difference === 1 && this.areEntriesCompleted(previousEntry, entry)) {
            if (this.streaks && this.streaks.length) {
                const lastStreak = this.streaks[this.streaks.length - 1];
                if (lastStreak.hasEnded) {
                    const newStreak = new Streak(this.habitId, prevEntryDate, nowEntryDate);
                    this.streaks.push(newStreak);
                } else {
                    this.incrementStreak(lastStreak.id, difference, nowEntryDate);
                }
            } else {
                this.streaks = [new Streak(this.habitId, prevEntryDate, nowEntryDate)];
            }
        } else if (this.streaks && this.streaks.length && !this.streaks[this.streaks.length - 1].hasEnded) {
            this.endStreak(this.streaks[this.streaks.length - 1].id, prevEntryDate);
        }
    }

    incrementStreak(streakId, incrementAmount, nowEntryDate) {
        this.verifyStreak(streakId, (streak) => streak.incrementStreak(incrementAmount, nowEntryDate));
    }

    endStreak(streakId, nowEntryDate) {
        this.verifyStreak(streakId, (streak) => streak.endStreak(nowEntryDate));
    }

    areEntriesCompleted(previousEntry, entry) {
        // assuming the habit is boolean 
        return previousEntry.performance >= this.speed.repetitions && entry.performance >= this.speed.repetitions;
    }

    verifyStreak(streakId, callback) {
        const streak = this.streaks.find(streak => streak.id == streakId);
        if (!streak) {
            return new Error("Streak not found");
        }
        callback(streak);
    };

    differenceBetweenDays = function (a1, b2) {
        if (!a1 || !b2) return;
        var a = new Date(a1);
        var b = new Date(b2);
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        if (!a || !b) {
            return 0;
        }
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    };

    getLongestStreak(habitId) {
        let longestStreak = this.streaks[0];
        for (let i = 1; i < this.streaks.length; i++) {
            if (this.streaks[i].streak > longestStreak.streak) {
                longestStreak = this.streaks[i]; // Update longest streak if the current streak is longer
            }
        }
        return longestStreak;
    }

    findActiveStreakWithoutEndDate(habitId) {
        const currentDate = new Date();
        let closestStreak = null;
        let closestDifference = Infinity;

        for (const streak of this.streaks) {
            if (!streak.endDate) {
                const difference = Math.abs(currentDate - streak.startDate);
                if (difference < closestDifference) {
                    closestStreak = streak;
                    closestDifference = difference;
                }
            }
        }
        return closestStreak;
    }
}

module.exports = {
    Streak,
    StreaksList
};
/**
 * difference is hardcoded although it should be taken from the habit or speed pref
 */