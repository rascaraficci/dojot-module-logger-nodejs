const Logger = require('../build/index.js');
const assume = require('assume');

const express = require('express');
const path = require('path');
const winston = require('winston');
const bodyParser = require("body-parser");

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.should();
const sinon = require('sinon');
require('@chrisalderson/winston-spy');

chai.use(chaiHttp);


//defining log
var logger = Logger.logger;

//defining app express
const app = express();
app.use(bodyParser.json());

//setting log debug route to app
Logger.addLoggerEndpoint(app);

app.listen(3000, () => { });


describe("Test logger module", () => {

    describe("Success Route connection", () => {
        it("tests connection to logger debug route", (done) => {

            let req = chai.request(app)
                .put('/log/config')
                .type("json")
                .send({"level": "debug"})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.have.header('content-type', 'text/html; charset=utf-8');
                    done();
                });
        });
    });


    describe("Error Route connection", () => {
        it("tests error connection if query is not correctly insert", (done) => {

            chai.request(app)
                .put('/log/config')
                .type("json")
                .send({"level": "a"})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.have.header('content-type', 'text/html; charset=utf-8');
                    done();
                });
        });
    });

    describe("Logger print", () => {
        const spy = sinon.spy();

        let consoleTransport;
        let transport;

        before(() => {
            consoleTransport = new winston.transports.Console({
                silent: true
            });
            transport = new winston.transports.SpyTransport({ spy });


            logger.add(consoleTransport);
            logger.add(transport);
        });

        it("tests if logger is called", () => {
            const info = {
                message: 'foo',
                level: 'info'
            };
            logger.log(info);


            assume(spy.calledOnce).true();
            assume(spy.calledWith(info)).true();
        });

        after(() => {
            logger.remove(consoleTransport);
            logger.remove(transport);
        });
    });
});