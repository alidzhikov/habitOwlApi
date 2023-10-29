exports.objectAssignIfExists = function (old, modified, skipList) {
    for (const key in modified) {
        if (skipList.indexOf(key) > -1) continue;
        if (old && key in old) {
            const newValue = modified[key];
            // console.log(key + ' -> ' + newValue)
            if (newValue) {
                old[key] = newValue;
            }
        }
    }
}
