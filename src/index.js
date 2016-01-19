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
    result.allVersions = result.version;
    if (result.commit) result.allVersions += "-" + result.commit.substr(0, 8);
    var knownCommits = [];
    for (var i = 0; i < packages.length; i++) {
        var folder = glob.sync("**/node_modules/" + packages[i])[0];
        var v = getVersion(folder);
        if (v.commit && knownCommits.indexOf(v) >= 0) {
            // the commit returned could be from a parent folder - remove duplicates
            delete v.commit;
        }
        if (v.commit) knownCommits.push(v.commit);

        if (v.version) result.allVersions += "-" + v.version;
        if (v.commit) result.allVersions += "-" + v.commit.substr(0, 8);

        result.packages[packages[i]] = v;
    }


    return result;
};

