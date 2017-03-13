module ApiHelper
  def json_parse(body)
    JSON.parse(body, symbolize_name: true)
  end

  def assert_status(code)
    expect(response.status).to eq(code)
  end

  def assert_count(json_result, expected)
    expect(json_result[:data].count).to eq(expected)
  end
end

RSpec.configure do |config|
  config.include ApiHelper
end
