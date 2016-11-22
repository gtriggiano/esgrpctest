'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createAggregate;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createAggregate(client, aggregateIdentity) {
  return new _bluebird2.default(function (resolve, reject) {
    var id = aggregateIdentity.id,
        type = aggregateIdentity.type;

    client.query('INSERT INTO aggregates (id, type, version)\n      VALUES ($1, $2, $3)', [id, type, 0], function (err) {
      if (err) return reject(err);
      resolve({
        id: id,
        type: type,
        version: 0
      });
    });
  });
}