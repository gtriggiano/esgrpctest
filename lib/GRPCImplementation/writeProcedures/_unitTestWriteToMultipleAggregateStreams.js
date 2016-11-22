'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.writeToMultipleAggregateStreams(call, callback)', function () {
  it('invokes callback(error) if !call.request.writeRequests.length', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      writeRequests: []
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);

    var callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.an.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/writingRequests should be a list of event storage requests/).length).equal(1);
  });
  it('invokes callback(error) if anyone of call.request.writeRequests is not a valid writeRequest', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // Missing aggregateIdentity
    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }]
      }, {
        events: [{ type: 'Test' }]
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    var callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/aggregateIdentity cannot be undefined/).length).equal(1);

    // Bad aggregateIdentity.type
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }]
      }, {
        aggregateIdentity: { id: 'Id', type: '' },
        events: [{ type: 'Test' }]
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/aggregateIdentity\.type should be a nonempty string/).length).equal(1);

    // Bad aggregateIdentity.id
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }]
      }, {
        aggregateIdentity: { id: '', type: 'TypeTwo' },
        events: [{ type: 'Test' }]
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/aggregateIdentity\.id should be a nonempty string/).length).equal(1);

    // Missing events
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }]
      }, {
        aggregateIdentity: { id: 'Id', type: 'TypeTwo' }
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/events should be a nonempty list of events to store/).length).equal(1);

    // Empty events
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }]
      }, {
        aggregateIdentity: { id: 'Id', type: 'TypeTwo' },
        events: []
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/events should be a nonempty list of events to store/).length).equal(1);

    // Bad event
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }]
      }, {
        aggregateIdentity: { id: 'Id', type: 'TypeTwo' },
        events: [{ type: 'Test' }, { type: '' }]
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/all events should have a valid type/).length).equal(1);
  });
  it('invokes callback(error) if each writeRequest does not concern a different aggregate', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }]
      }, {
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'TestTwo' }]
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    var callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/each writeRequest should concern a different aggregate/).length).equal(1);
  });
  it('invokes backend.storeEvents() with right parameters', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }],
        expectedAggregateVersion: 3
      }, {
        aggregateIdentity: { id: 'Id', type: 'TypeTwo' },
        events: [{ type: 'TestTwo', data: 'hello' }],
        expectedAggregateVersion: -10
      }]
    };
    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    var backendCalls = simulation.backend.storeEvents.getCalls();
    (0, _asFunction2.default)(backendCalls.length).equal(1);
    (0, _asFunction2.default)(backendCalls[0].args[0].writeRequests.length).equal(2);
    (0, _asFunction2.default)(backendCalls[0].args[0].writeRequests).eql([{
      aggregateIdentity: { id: 'Id', type: 'TypeOne' },
      events: [{ type: 'Test', data: '', metadata: '' }],
      expectedAggregateVersion: 3
    }, {
      aggregateIdentity: { id: 'Id', type: 'TypeTwo' },
      events: [{ type: 'TestTwo', data: 'hello', metadata: '' }],
      expectedAggregateVersion: -1
    }]);
    (0, _asFunction2.default)(backendCalls[0].args[0].transactionId).be.a.String();
    (0, _asFunction2.default)(_shortid2.default.isValid(backendCalls[0].args[0].transactionId)).be.True();
  });
  it('invokes callback(err) if there is an error executing any of the writeRequests', function (done) {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    var errMsg = 'failure ' + (0, _shortid2.default)();
    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }],
        expectedAggregateVersion: 3
      }, {
        aggregateIdentity: { id: 'Id', type: 'TypeTwo' },
        events: [{ type: 'TestTwo', data: 'hello', metadata: errMsg }],
        expectedAggregateVersion: -10
      }]
    };

    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    setTimeout(function () {
      var callbackCalls = simulation.callback.getCalls();
      (0, _asFunction2.default)(callbackCalls.length).equal(1);
      (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
      (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
      (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(new RegExp(errMsg)).length).equal(1);
      done();
    }, 5);
  });
  it('invokes callback(null, {events}) if the events writing is succcessful', function (done) {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      writeRequests: [{
        aggregateIdentity: { id: 'Id', type: 'TypeOne' },
        events: [{ type: 'Test' }],
        expectedAggregateVersion: 3
      }, {
        aggregateIdentity: { id: 'Id', type: 'TypeTwo' },
        events: [{ type: 'TestTwo', data: 'hello', metadata: 'world' }],
        expectedAggregateVersion: -10
      }]
    };

    implementation.writeToMultipleAggregateStreams(simulation.call, simulation.callback);
    setTimeout(function () {
      var callbackCalls = simulation.callback.getCalls();
      (0, _asFunction2.default)(callbackCalls.length).equal(1);
      (0, _asFunction2.default)(callbackCalls[0].args.length).equal(2);
      (0, _asFunction2.default)(callbackCalls[0].args[0]).be.Null();
      (0, _asFunction2.default)(callbackCalls[0].args[1]).eql({
        events: simulation.call.request.writeRequests.reduce(function (storedEvents, request, rIdx) {
          return storedEvents.concat(request.events.map(function (e, eIdx) {
            return _extends({
              id: '' + rIdx + eIdx,
              aggregateIdentity: request.aggregateIdentity,
              data: '',
              metadata: ''
            }, e);
          }));
        }, [])
      });
      done();
    }, 5);
  });
});