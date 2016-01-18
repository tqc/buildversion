var fs = require("fs");
var path = require("path");
var git = require("gitrunner");
git.runSync = true;

var glob = require("glob");


function getVersion(folder) {
    var result = {};
    var packageFile = path.resolve(folder, "package.json");
    if (fs.existsSync(packageFile)) {
        var packageData = JSON.parse(fs.readFileSync(packageFile, "utf8"));
        result.name = packageData.name;
        result.version = packageData.version;
    }

    var head = git.currentHead(folder);
    if (head) result.commit = head;

    return result;

}


module.exports = function(packages) {

    var result = getVersion(process.cwd());

    packages = packages || [];
    result.packages = {};
    for (var i = 0; i < packages.length; i++) {
        var folder = glob.sync("**/node_modules/" + packages[i])[0];
        result.packages[packages[i]] = getVersion(folder);
    }


    return result;
};

