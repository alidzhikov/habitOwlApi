const speedStatus = require('../models/mappings/goalStatus');

exports.validateSpeedPeriod = function(habit, speeds) {
    let newSpeed;
    speeds.map(speedModified => {
        if (!speedModified.id) {
            newSpeed = speedModified;
        }
    });
    return newSpeed;
    //skip validation since we can have now multiple active speeds
    if (!newSpeed) return null;
    let newSpeedStart = new Date(newSpeed.startDate).getTime();
    let newSpeedEnd = newSpeed.endDate ? new Date(newSpeed.endDate).getTime() : null;
    
    if (newSpeedEnd && newSpeedStart >= newSpeedEnd) {
        return null;
    }

    let habitSpeeds = habit.toJSON().speeds;
    
    getSpeedStatus(habitSpeeds, newSpeed);

    habitSpeeds.push(newSpeed);

    return isSpeedDatePeriodValid(habitSpeeds) ? newSpeed : null;
}

function getSpeedStatus(existingSpeeds, speed) {
    let activeSprint = existingSpeeds.filter(exSpeed => exSpeed.status === speedStatus.active)[0] || existingSpeeds[0];
    let speedStart = new Date(speed.startDate).getTime();
    let speedEnd = speed.endDate ? new Date(speed.endDate).getTime() : null;
    let now = Date.now();
    let shouldHaveEndDate = false;

    if (speedStart > now) {
        speed.status = speedStatus.upcoming;
    } else if (speedStart < now && (!speed.endDate || speedEnd > now)) {
        speed.status = activeSprint ? speedStatus.notSet : speedStatus.active;
    } else if (!speed.endDate || speedEnd < now) {
        speed.status = speedStatus.archived;
        shouldHaveEndDate = new Date();
        shouldHaveEndDate.setDate(shouldHaveEndDate.getDate() - 1);
        speed.endDate = shouldHaveEndDate;
    }
}

function speedsByStartDate(speed1, speed2) {
    const speed1StartDate = new Date(speed1.startDate).getTime();
    const speed2StartDate = new Date(speed2.startDate).getTime();
    return speed1StartDate >= speed2StartDate;
}

function isSpeedDatePeriodValid(habitSpeeds) {
    var newSpeedValid = true;
      // Add the speed to existing and sort then check the timeline

      habitSpeeds.sort(speedsByStartDate).forEach((exSpeed,i) => {
        
        let exSpeedStart = new Date(exSpeed.startDate).getTime();
        let exSpeedEnd = exSpeed.endDate ? new Date(exSpeed.endDate).getTime() : null;

        if ('_id' in exSpeed) {
            return;
        }
        let nextSpeed = habitSpeeds[i + 1];
        let prevSpeed = habitSpeeds[i - 1];
        if (prevSpeed) {
            let prevSpeedEnd = prevSpeed.endDate ? new Date(prevSpeed.endDate).getTime() : null;
            if (!prevSpeedEnd) {
                
                // what if there is next speed here
                // and what if there is
                if (prevSpeed.status == speedStatus.active) {
                    // ok 
                    // change prev speed end date to first date -1 of new speed
                    // what if there are entries from last one 

                } else {
                    // error why doesn't previous speed have end date 
                    // set to first date again of new speed
                    newSpeedValid = false;
                }
            } else {
                if (exSpeedStart <= prevSpeedEnd) {
                    // invalid time start falls into the preivious
                    newSpeedValid = false;
                } else {
                    // ok
                }
            }
        }
        if (nextSpeed) {
            if (!exSpeedEnd) {
                // Not a valid end date there is a 
                // next speed so this one should be max the start of next one
                newSpeedValid = false;
            } else {
                let nextSpeedStart = new Date(nextSpeed.startDate).getTime();
                //let nextSpeedEnd = nextSpeed.endDate ? new Date(exSpeed.endDate).getTime() : null;
                if (exSpeedEnd >= nextSpeedStart) {
                    // error falls into next one
                    newSpeedValid = false;
                } else {
                    //ok
                }
            }   
        }
    });
    return newSpeedValid;
}