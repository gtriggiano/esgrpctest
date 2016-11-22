'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createAggregateSnapshot;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createAggregateSnapshot(client, aggregateIdentity, version, data) {
  return new _bluebird2.default(function (resolve, reject) {
    var id = aggregateIdentity.id,
        type = aggregateIdentity.type;

    var insertQueryString = '\n      INSERT INTO snapshots\n        (\n          aggregateId,\n          aggregateType,\n          version,\n          data\n        )\n      VALUES ($1, $2, $3, $4)';

    client.query(insertQueryString, [id, type, version, new Buffer(data, 'utf8')], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}