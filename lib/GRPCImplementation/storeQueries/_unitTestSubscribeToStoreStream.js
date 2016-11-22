'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.subscribeToStoreStream(call)', function () {
  it('invokes call.write() for every live event', function (done) {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {};
    implementation.subscribeToStoreStream(simulation.call);
    simulation.store.publishEvents([{ id: 100010 }, { id: 100011 }, { id: 100012 }]);

    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(3);
      (0, _asFunction2.default)(writeCalls.map(function (_ref) {
        var args = _ref.args;
        return args[0] && args[0].id;
      })).containDeepOrdered([100010, 100011, 100012]);
      simulation.call.emit('end');
      done();
    }, 150);
  });
  it('stops invoking call.write() if client ends subscription', function (done) {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {};
    implementation.subscribeToStoreStream(simulation.call);
    simulation.store.publishEvents([{ id: 100010 }, { id: 100011 }, { id: 100012 }]);

    setTimeout(function () {
      simulation.call.emit('end');
      simulation.store.publishEvents([{ id: 100013 }, { id: 100014 }]);
    }, 200);

    setTimeout(function () {
      var calls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(calls.length).equal(3);
      (0, _asFunction2.default)(calls.map(function (_ref2) {
        var args = _ref2.args;
        return args[0] && args[0].id;
      })).not.containDeepOrdered([100013, 100014]);
      done();
    }, 350);
  });
});