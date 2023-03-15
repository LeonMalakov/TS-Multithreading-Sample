import { Cluster } from "cluster";

const cluster : Cluster = require("cluster");

if(cluster.isPrimary) {
    console.log("Am Master");
    cluster.fork();
} else {
    console.log(`Not master`);
}

console.log("Done");