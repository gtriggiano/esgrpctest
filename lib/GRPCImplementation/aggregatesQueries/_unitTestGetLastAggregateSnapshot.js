'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _lodash = require('lodash');

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.getLastAggregateSnapshot(call, callback)', function () {
  it('calls callback(err) if call.request is not a valid aggregateIdentity', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // Bad aggregateIdentity.id
    simulation.call.request = { id: '', type: 'test' };
    implementation.getLastAggregateSnapshot(simulation.call, simulation.callback);
    var callbackArgs = simulation.callback.firstCall.args;

    (0, _asFunction2.default)(simulation.callback.calledOnce).be.True();
    (0, _asFunction2.default)(callbackArgs[0]).be.an.instanceof(Error);

    // Bad aggregateIdentity.type
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = { id: 'test', type: '' };
    implementation.getLastAggregateSnapshot(simulation.call, simulation.callback);
    callbackArgs = simulation.callback.firstCall.args;

    (0, _asFunction2.default)(simulation.callback.calledOnce).be.True();
    (0, _asFunction2.default)(callbackArgs[0]).be.an.instanceof(Error);
  });
  it('invokes backend.getLastSnapshotOfAggregate() with right parameters', function () {
    var testSnapshot = data.snapshots.get((0, _lodash.random)(data.snapshots.size - 1));
    var aggregateIdentity = {
      id: testSnapshot.get('aggregateId'),
      type: testSnapshot.get('aggregateType')
    };

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = aggregateIdentity;
    implementation.getLastAggregateSnapshot(simulation.call, simulation.callback);

    var calls = simulation.backend.getLastSnapshotOfAggregate.getCalls();
    (0, _asFunction2.default)(calls.length).equal(1);
    (0, _asFunction2.default)(calls[0].args[0].aggregateIdentity).containEql(aggregateIdentity);
  });
  it('invokes callback(null, {snapshot}) if a snapshot is found', function (done) {
    // Take a random snapshot
    var randomSnapshot = data.snapshots.get((0, _lodash.random)(data.snapshots.size - 1));
    // Get its aggregate's identity
    var aggregateIdentity = {
      id: randomSnapshot.get('aggregateId'),
      type: randomSnapshot.get('aggregateType')
    };
    // Take the last snapshot of the aggregate
    var testSnapshot = data.snapshots.filter(function (snapshot) {
      return snapshot.get('aggregateId') === aggregateIdentity.id && snapshot.get('aggregateType') === aggregateIdentity.type;
    }).takeLast(1).get(0);

    var expectedSnapshotResponse = {
      snapshot: {
        aggregateIdentity: aggregateIdentity,
        data: testSnapshot.get('data'),
        version: testSnapshot.get('version')
      }
    };

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = aggregateIdentity;
    implementation.getLastAggregateSnapshot(simulation.call, simulation.callback);

    setTimeout(function () {
      var calls = simulation.callback.getCalls();
      (0, _asFunction2.default)(calls.length).equal(1);
      (0, _asFunction2.default)(calls[0].args[0]).be.Null();
      (0, _asFunction2.default)(calls[0].args[1]).containEql(expectedSnapshotResponse);
      done();
    }, 5);
  });
  it('invokes callback(null, {notFound: {}}) if a snapshot is not found', function (done) {
    var aggregateIdentity = {
      id: 'Not',
      type: 'Existent'
    };

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = aggregateIdentity;
    implementation.getLastAggregateSnapshot(simulation.call, simulation.callback);

    setTimeout(function () {
      var calls = simulation.callback.getCalls();
      (0, _asFunction2.default)(calls.length).equal(1);
      (0, _asFunction2.default)(calls[0].args[0]).be.Null();
      (0, _asFunction2.default)(calls[0].args[1]).containEql({ notFound: {} });
      done();
    }, 5);
  });
});