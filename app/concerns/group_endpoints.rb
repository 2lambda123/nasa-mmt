# Controller methods that allows developers to get this data without
# making an HTTP request (with the exception of the URS call)
module GroupEndpoints
  extend ActiveSupport::Concern

  def urs_user_full_name(user)
    [user['first_name'], user['last_name']].compact.join(' ')
  end

  def render_users_from_urs(users)
    users.map do |u|
      {
        id: u['uid'],
        text: urs_user_full_name(u)
      }
    end
  end

  def search_urs(query)
    urs_response = cmr_client.search_urs_users(query)

    if urs_response.success?
      urs_response.body['users'] || []
    else
      []
    end
  end

  def retrieve_urs_users(uids)
    users_response = cmr_client.get_urs_users(uids)

    if users_response.success?
      users_response.body.fetch('users', [])
    else
      []
    end
  end
end
