'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getAggregate;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAggregate(client, aggregateIdentity) {
  return new _bluebird2.default(function (resolve, reject) {
    var id = aggregateIdentity.id,
        type = aggregateIdentity.type;

    client.query('SELECT * FROM aggregates\n       WHERE id = $1 AND type = $2', [id, type], function (err, result) {
      if (err) return reject(err);
      if (!result.rows[0]) return resolve();
      var _result$rows$ = result.rows[0],
          id = _result$rows$.id,
          type = _result$rows$.type,
          version = _result$rows$.version;

      resolve({
        id: id,
        type: type,
        version: parseInt(version, 10)
      });
    });
  });
}