from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    reddit_client_id: str | None = Field(default=None, alias='REDDIT_CLIENT_ID')
    reddit_client_secret: str | None = Field(default=None, alias='REDDIT_CLIENT_SECRET')
    reddit_user_agent: str = Field(default='reddit-pain-miner/0.1', alias='REDDIT_USER_AGENT')
    reddit_subreddits: str = Field(default='Entrepreneur,SaaS,smallbusiness,startups', alias='REDDIT_SUBREDDITS')
    mock_mode: bool = Field(default=True, alias='MOCK_MODE')
    db_path: str = Field(default='./data/painminer.db', alias='DB_PATH')


settings = Settings()
