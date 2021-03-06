'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _eventRecordToDTO = require('../helpers/eventRecordToDTO');

var _eventRecordToDTO2 = _interopRequireDefault(_eventRecordToDTO);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getEventsByTypesFactory(getConnection) {
  return function (_ref) {
    var eventTypes = _ref.eventTypes,
        fromEventId = _ref.fromEventId,
        limit = _ref.limit;

    var typesPlaceholders = eventTypes.map(function (_, i) {
      return '$' + (i + 2);
    }).join(', ');

    var queryStr = 'SELECT * FROM events\n                    WHERE id > $1\n                      AND type IN (' + typesPlaceholders + ')\n                    ORDER BY id ';
    var queryParams = [fromEventId].concat(_toConsumableArray(eventTypes));

    if (limit) {
      queryStr += 'LIMIT $' + (eventTypes.length + 2);
      queryParams.push(limit);
    }

    var results = new _eventemitter2.default();

    getConnection(function (err, _ref2) {
      var client = _ref2.client,
          release = _ref2.release;

      if (err) return results.emit('error', err);

      var query = client.query(queryStr, queryParams);

      query.on('row', function (row) {
        return results.emit('event', (0, _eventRecordToDTO2.default)(row));
      });
      query.on('error', function (err) {
        results.emit('error', err);
        query.removeAllListeners();
        release();
      });
      query.on('end', function () {
        results.emit('end');
        query.removeAllListeners();
        release();
      });
    });

    return results;
  };
}

exports.default = getEventsByTypesFactory;