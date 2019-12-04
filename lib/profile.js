/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */

exports.parse = function (json) {
  if (typeof json === 'string') {
    json = JSON.parse(json)
  }

  var profile = {}
  profile.user_id = json.user_id
  profile.email = json.email
  profile.username = json.username

  return profile
}
