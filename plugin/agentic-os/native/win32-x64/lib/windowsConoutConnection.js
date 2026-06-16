"use strict";
/**
 * Copyright (c) 2020, Microsoft Corporation (MIT License).
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConoutConnection = void 0;
var net_1 = require("net");
var conout_1 = require("./shared/conout");
var path_1 = require("path");
var eventEmitter2_1 = require("./eventEmitter2");
/**
 * The amount of time to wait for additional data after the conpty shell process has exited before
 * shutting down the worker and sockets. The timer will be reset if a new data event comes in after
 * the timer has started.
 */
var FLUSH_DATA_INTERVAL = 1000;
/**
 * Connects to and manages the lifecycle of the conout socket. This socket must be drained on
 * another thread in order to avoid deadlocks where Conpty waits for the out socket to drain
 * when `ClosePseudoConsole` is called. This happens when data is being written to the terminal when
 * the pty is closed.
 *
 * See also:
 * - https://github.com/microsoft/node-pty/issues/375
 * - https://github.com/microsoft/vscode/issues/76548
 * - https://github.com/microsoft/terminal/issues/1810
 * - https://docs.microsoft.com/en-us/windows/console/closepseudoconsole
 */
var ConoutConnection = /** @class */ (function () {
    function ConoutConnection(_conoutPipeName, _useConptyDll) {
        var _this = this;
        this._conoutPipeName = _conoutPipeName;
        this._useConptyDll = _useConptyDll;
        this._isDisposed = false;
        this._onReady = new eventEmitter2_1.EventEmitter2();
        // Obsidian's Electron renderer cannot construct worker_threads Workers
        // ("Failed to construct 'Worker': The V8 platform ... does not support creating Workers").
        // Instead of draining the conout socket on a separate thread, do the same bridging
        // (connect to the raw conout pipe, re-serve it on the "-worker" pipe) inline on the
        // main thread. This mirrors lib/worker/conoutSocketWorker.js exactly.
        try {
            var inSocket = new net_1.Socket();
            inSocket.setEncoding('utf8');
            inSocket.on('error', function (err) {
                console.error('[agentic-os] conout inSocket error', err);
            });
            inSocket.connect(_conoutPipeName, function () {
                var server = net_1.createServer(function (workerSocket) {
                    inSocket.pipe(workerSocket);
                });
                server.on('error', function (err) {
                    console.error('[agentic-os] conout server error', err);
                });
                server.listen(conout_1.getWorkerPipeName(_conoutPipeName), function () {
                    _this._onReady.fire();
                });
                _this._server = server;
            });
            this._inSocket = inSocket;
        }
        catch (err) {
            // Never let a conout failure abort spawnSession; log and continue.
            console.error('[agentic-os] inline conout bridge failed', err);
        }
    }
    Object.defineProperty(ConoutConnection.prototype, "onReady", {
        get: function () { return this._onReady.event; },
        enumerable: false,
        configurable: true
    });
    ConoutConnection.prototype.dispose = function () {
        if (!this._useConptyDll && this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        // Drain all data from the socket before closing
        this._drainDataAndClose();
    };
    ConoutConnection.prototype.connectSocket = function (socket) {
        socket.connect(conout_1.getWorkerPipeName(this._conoutPipeName));
    };
    ConoutConnection.prototype._drainDataAndClose = function () {
        var _this = this;
        if (this._drainTimeout) {
            clearTimeout(this._drainTimeout);
        }
        this._drainTimeout = setTimeout(function () { return _this._destroySocket(); }, FLUSH_DATA_INTERVAL);
    };
    ConoutConnection.prototype._destroySocket = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this._server) {
                        this._server.close();
                        this._server = undefined;
                    }
                    if (this._inSocket) {
                        this._inSocket.destroy();
                        this._inSocket = undefined;
                    }
                }
                catch (err) {
                    console.error('[agentic-os] conout teardown error', err);
                }
                return [2 /*return*/];
            });
        });
    };
    return ConoutConnection;
}());
exports.ConoutConnection = ConoutConnection;
//# sourceMappingURL=windowsConoutConnection.js.map
