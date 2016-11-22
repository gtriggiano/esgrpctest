'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = updateAggregateVersion;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateAggregateVersion(client, aggregateIdentity, version) {
  return new _bluebird2.default(function (resolve, reject) {
    var id = aggregateIdentity.id,
        type = aggregateIdentity.type;

    client.query('UPDATE aggregates\n      SET version = $3\n      WHERE id = $1\n        AND type = $2', [id, type, version], function (err) {
      if (err) return reject(err);
      resolve({
        id: id,
        type: type,
        version: version
      });
    });
  });
}