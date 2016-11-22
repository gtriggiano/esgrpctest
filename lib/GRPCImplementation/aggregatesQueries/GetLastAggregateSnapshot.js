'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../../utils');

function GetLastAggregateSnapshot(_ref) {
  var backend = _ref.backend;

  return function (call, callback) {
    var _call$request = call.request,
        id = _call$request.id,
        type = _call$request.type;

    if (!(0, _utils.isValidString)(id)) return callback(new TypeError('AggregateIdentity.id should be a non empty string'));
    if (!(0, _utils.isValidString)(type)) return callback(new TypeError('AggregateIdentity.type should be a non empty string'));

    var replied = false;
    var reply = function reply(snapshot) {
      if (replied) return;
      replied = true;
      if (snapshot) return callback(null, { snapshot: snapshot });
      callback(null, { notFound: {} });
    };

    var params = { aggregateIdentity: call.request };
    var backendResults = backend.getLastSnapshotOfAggregate(params);
    backendResults.on('snapshot', reply);
    backendResults.on('end', reply);
  };
}

exports.default = GetLastAggregateSnapshot;