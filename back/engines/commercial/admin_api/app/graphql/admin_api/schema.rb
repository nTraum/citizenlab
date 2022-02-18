module AdminApi
  class Schema < GraphQL::Schema
    # Required:
    query Types::QueryType

    default_max_page_size 100
  end
end
