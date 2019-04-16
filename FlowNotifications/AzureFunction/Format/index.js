const axios = require('axios');

module.exports = async function (context, req) {
    if (req.query.since && req.query.instance && req.query.clientrequestid && req.query.name) {
        context.log('JavaScript HTTP trigger function processing a request for ' + req.query.name);
        var url = "http://endpoints.office.com/changes/" + req.query.instance + "/" + req.query.since + "?clientrequestid=" + req.query.clientrequestid;
        var response = await axios.get(url);
        var changes = JSON.parse(JSON.stringify(response.data))
        context.res = {
            headers: {
                "Content-Type": "text/html"
            },
            body: "<!DOCTYPE html><html><head><title>Table of changes</title>" +
            "<style>table, th, td {border: 1px solid black;border-collapse: collapse;font-family: Segoe UI, Helvetica, sans-serif;}" +
            "th, td {padding: 8px;} p {font-family: Segoe UI, Helvetica, sans-serif;} h2 {font-family: Segoe UI, Helvetica, sans-serif;}" +
            "</style></head><body>" +
            "<p>Recent changes for Office 365 IP Addresses and URLs. For more information please see <a href='http://aka.ms/ipurlws'>http://aka.ms/ipurlws</a></p>" +
            formatChanges(changes) + "</body></html>"
        };
    } else {
        context.log('JavaScript HTTP trigger function processed a request with an invalid parameters.');
        context.res = {
            status: 400,
            body: "Please pass query string parameters since, instance, clientrequestid, and key. Docs at http://aka.ms/ipurlws"
        };
    }
}

function formatChanges(changes) {
    var out = ""
    changes.forEach(function(obj) { 
        out += "<h2>Change {0}</h2>".replace("{0}", obj.id)
        out += "<p>Endpoint Set ID: " + obj.endpointSetId 
        out += ", Disposition: " + obj.disposition 
        out += ", Version " + obj.version 
        if (isdef(obj.impact)) {
            out += ", Impact: " + obj.impact 
        }
        out += "</p><table style='width:100%'><tbody>"
        if (isdef(obj.previous)) {
            out += "<tr><td><b>Previous</b></td></tr>" + formatSub(obj.previous)
        } 
        if (isdef(obj.current)) {
            out += "<tr><td><b>Current</b></td></tr>" + formatSub(obj.current)
        } 
        if (isdef(obj.add)) {
            out += "<tr><td><b>Add</b></td></tr><tr><td>"
            if (isdef(obj.add.effectiveDate)) {
                out += "Effective Date: {0} ".replace("{0}", obj.add.effectiveDate)
            }
            if (isdef(obj.add.urls)) {
                out += "URLs: "
                var first = true
                obj.add.urls.forEach(function(url) {
                    if (!first) { out += ", " }
                    out += url
                    first = false
                })
                out += " "
            }
            if (isdef(obj.add.ips)) {
                out += "IP Addresses: "
                var first = true
                obj.add.ips.forEach(function(url) {
                    if (!first) { out += ", "}
                    out += url
                    first = false
                })
            }
            out += "</td></tr>"
        } else if (isdef(obj.remove)) {
            out += "<tr><td><b>Remove</b></td></tr><tr><td>"
            if (isdef(obj.remove.urls)) {
                out += "URLs: "
                var first = true
                obj.remove.urls.forEach(function(url) {
                    if (!first) { out += ", "}
                    out += url
                    first = false
                })
                out += " "
            }
            if (isdef(obj.remove.ips)) {
                out += "IP Addresses: "
                var first = true
                obj.remove.ips.forEach(function(url) {
                    if (!first) { out += ", "}
                    out += url
                    first = false
                })
            }
            out += "</td></tr>"
        } 
        out += "</tbody></table>"
    });
    return out;
}

function formatSub(node){
    var out = "<tr><td>" 
    var first = true
    if (isdef(node.expressRoute)) {
        if (!first) { out += ", "}; first = false
        out += "ExpressRoute: " + node.expressRoute 
    }
    if (isdef(node.serviceArea)) {
        if (!first) { out += ", "}; first = false
        out += "serviceArea: " + node.serviceArea 
    }
    if (isdef(node.category)) {
        if (!first) { out += ", "}; first = false
        out += "category: " + node.category 
    }
    if (isdef(node.notes)) {
        if (!first) { out += ", "}; first = false
        out += "notes: " + node.notes 
    }
    if (isdef(node.required)) {
        if (!first) { out += ", "}; first = false
        out += "required: " + node.required 
    }
    if (isdef(node.tcpPorts)) {
        if (!first) { out += ", "}; first = false
        out += "tcpPorts: " + node.tcpPorts 
    }
    if (isdef(node.udpPorts)) {
        if (!first) { out += ", "}; first = false
        out += "udpPorts: " + node.udpPorts 
    }
    out += "</td></tr>"
    return out;
}

function isdef(node){
    return (typeof node !== 'undefined');
}