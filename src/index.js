var fs = require("fs");
var path = require("path");
var git = require("gitrunner").Sync;

var glob = require("glob");


function getVersion(folder) {
    if (!folder) return {
        version: "0.0.0"
    }
    var result = {};
    var packageFile = path.resolve(folder, "package.json");
    if (fs.existsSync(packageFile)) {
        var packageData = JSON.parse(fs.readFileSync(packageFile, "utf8"));
        result.name = packageData.name;
        result.version = packageData.version;
    }

    // TODO: this won't work properly with npm 3
    var parentPackageFile = path.resolve(folder, "../../package.json");
    if (fs.existsSync(parentPackageFile)) {
        var ppd = JSON.parse(fs.readFileSync(parentPackageFile, "utf8"));
        if (ppd.dependencies && ppd.dependencies[result.name]) {
            result.requestedVersion = ppd.dependencies[result.name];
        }
    }

    if (fs.existsSync(path.resolve(folder, ".git"))) {
        // folder is a git repo set up via npm link
        // need to resolve the symlinks, as a submodule can have relative paths in .git
        var head = git.currentHead(fs.realpathSync(folder));
        if (head) result.commit = head;
    }
    else if (result.requestedVersion && result.requestedVersion.indexOf("git+ssh://") == 0 && result.requestedVersion.indexOf("#") < 0) {
        // npm does not keep the the metadata for git dependencies, so
        // the best we can do is ask the remote server for the current value of master
        console.log("Getting remote refs");
        var refs = git.remoteRefs(result.requestedVersion.substr(10));
        if (!refs) {
            console.log("Error getting refs for " + result.requestedVersion.substr(10))
        }
        if (refs && refs.master) result.commit = refs.master;
    }

    return result;

}


module.exports = function(packages) {

    var result = getVersion(process.cwd());

    packages = packages || [];
    result.packages = {};
    result.allVersions = result.version;
    var knownCommits = [];
    if (result.commit) {
        knownCommits.push(result.commit);
        result.allVersions += "-" + result.commit.substr(0, 8);
    }
    for (var i = 0; i < packages.length; i++) {
        var folder = path.resolve(process.cwd(), "./node_modules/" + packages[i]);
        if (!fs.existsSync(folder)) folder = path.resolve(process.cwd(), "./node_modules/" + packages[i - 1] + "/node_modules/" + packages[i]);
        if (!fs.existsSync(folder)) folder = glob.sync("node_modules/*/node_modules/" + packages[i])[0];
        if (!folder) folder = glob.sync("node_modules/**/node_modules/" + packages[i])[0];
        var v = getVersion(folder);
        if (v.commit && knownCommits.indexOf(v.commit) >= 0) {
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

