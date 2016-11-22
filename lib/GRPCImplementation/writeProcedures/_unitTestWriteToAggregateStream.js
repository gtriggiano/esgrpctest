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

describe('.writeToAggregateStream(call, callback)', function () {
  it('invokes callback(error) if call.request.aggregateIdentity is not a valid aggregateIdentity', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // No aggregateIdentity
    simulation.call.request = { events: [{ type: 'Test' }] };
    implementation.writeToAggregateStream(simulation.call, simulation.callback);
    var callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/aggregateIdentity cannot be undefined/).length).equal(1);

    // Bad aggregateIdentity.id
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      aggregateIdentity: { id: '', type: 'Test' },
      events: [{ type: 'Test' }]
    };
    implementation.writeToAggregateStream(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/aggregateIdentity\.id should be a nonempty string/).length).equal(1);

    // Bad aggregateIdentity.type
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      aggregateIdentity: { id: 'Test', type: '' },
      events: [{ type: 'Test' }]
    };
    implementation.writeToAggregateStream(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/aggregateIdentity\.type should be a nonempty string/).length).equal(1);
  });
  it('invokes callback(error) if call.request.events is not a nonempty list of valid events to store', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // Empty list of events
    simulation.call.request = {
      aggregateIdentity: { id: 'id', type: 'type' },
      events: []
    };
    implementation.writeToAggregateStream(simulation.call, simulation.callback);
    var callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/events should be a nonempty list of events to store/).length).equal(1);

    // Bad events in the list
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      aggregateIdentity: { id: 'id', type: 'type' },
      events: [{ type: 'type', data: 'data' }, { data: 'data' }]
    };
    implementation.writeToAggregateStream(simulation.call, simulation.callback);
    callbackCalls = simulation.callback.getCalls();
    (0, _asFunction2.default)(callbackCalls.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args.length).equal(1);
    (0, _asFunction2.default)(callbackCalls[0].args[0]).be.instanceof(Error);
    (0, _asFunction2.default)(callbackCalls[0].args[0].message.match(/all events should have a valid type/).length).equal(1);
  });
  it('invokes backend.storeEvents() with right parameters', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    var aggregateIdentity = { id: 'id', type: 'type' };
    var events = [{ type: 'TypeOne', data: 'one' }, { type: 'TypeTwo', data: 'two' }];
    var expectedAggregateVersion = 10;
    var snapshot = 'snapshot';
    simulation.call.request = {
      aggregateIdentity: aggregateIdentity,
      events: events,
      expectedAggregateVersion: expectedAggregateVersion,
      snapshot: snapshot
    };

    implementation.writeToAggregateStream(simulation.call, simulation.callback);
    var backendCalls = simulation.backend.storeEvents.getCalls();
    (0, _asFunction2.default)(backendCalls.length).equal(1);
    (0, _asFunction2.default)(backendCalls[0].args[0].writeRequests.length).equal(1);
    (0, _asFunction2.default)(backendCalls[0].args[0].writeRequests[0]).eql({
      aggregateIdentity: aggregateIdentity,
      events: events.map(function (e) {
        return _extends({
          data: '',
          metadata: ''
        }, e);
      }),
      expectedAggregateVersion: expectedAggregateVersion,
      snapshot: snapshot
    });
    (0, _asFunction2.default)(backendCalls[0].args[0].transactionId).be.a.String();
    (0, _asFunction2.default)(_shortid2.default.isValid(backendCalls[0].args[0].transactionId)).be.True();
  });
  it('invokes callback(err) if there is an error writing the events', function (done) {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    var errMsg = 'failure ' + (0, _shortid2.default)();
    simulation.call.request = {
      aggregateIdentity: { id: 'id', type: 'type' },
      events: [{ type: 'TypeOne', data: 'one' }, { type: 'TypeTwo', data: 'two', metadata: errMsg }],
      expectedAggregateVersion: 0
    };

    implementation.writeToAggregateStream(simulation.call, simulation.callback);
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

    var aggregateIdentity = { id: 'id', type: 'type' };
    var events = [{ type: 'TypeOne', data: 'one' }, { type: 'TypeTwo' }];
    var expectedStoredEvents = events.map(function (e, idx) {
      return _extends({
        id: '0' + idx,
        aggregateIdentity: aggregateIdentity,
        data: '',
        metadata: ''
      }, e);
    });
    simulation.call.request = {
      aggregateIdentity: aggregateIdentity,
      events: events,
      expectedAggregateVersion: 0
    };

    implementation.writeToAggregateStream(simulation.call, simulation.callback);
    setTimeout(function () {
      var callbackCalls = simulation.callback.getCalls();
      (0, _asFunction2.default)(callbackCalls.length).equal(1);
      (0, _asFunction2.default)(callbackCalls[0].args.length).equal(2);
      (0, _asFunction2.default)(callbackCalls[0].args[0]).be.Null();
      (0, _asFunction2.default)(callbackCalls[0].args[1]).eql({ events: expectedStoredEvents });
      done();
    }, 5);
  });
});