import strawberry
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
@strawberry.enum
class UserRole(Enum):
    ADMIN = "admin"
    STUDENT = "student"

@strawberry.enum
class VideoPlatform(Enum):
    YOUTUBE = "youtube"
    VIMEO = "vimeo"
    AZURE = "azure"
    DIRECT = "direct"

@strawberry.enum
class ContentType(Enum):
    PRESENTATION = "presentation"
    RECORDING = "recording"

# Types
@strawberry.type
class Recording:
    recording_id: str
    day_number: int
    title: str
    video_url: str
    embed_url: Optional[str]
    platform: VideoPlatform
    duration: str
    uploaded_at: datetime
    uploaded_by: str
    view_count: int
    is_active: bool

@strawberry.type
class TrainingDay:
    day_number: int
    title: str
    description: str
    is_unlocked: bool
    unlocked_at: Optional[datetime]
    unlocked_by: Optional[str]
    presentation_url: str
    resources_url: Optional[str]
    recording: Optional[Recording]
    created_at: datetime
    updated_at: datetime

@strawberry.type
class User:
    user_id: str
    email: str
    role: UserRole
    created_at: datetime
    last_login: Optional[datetime]

@strawberry.type
class UserProgress:
    progress_id: str
    user_id: str
    day_number: int
    viewed_presentation: bool
    viewed_recording: bool
    completion_percentage: float
    last_accessed: datetime

@strawberry.type
class AdminAction:
    action_id: str
    admin_id: str
    action_type: str
    day_number: Optional[int]
    metadata: Optional[str]
    timestamp: datetime

@strawberry.type
class DashboardStats:
    total_days: int
    unlocked_days: int
    locked_days: int
    recordings_available: int
    total_users: int
    active_students: int

# Input Types
@strawberry.input
class UnlockDayInput:
    day_number: int
    admin_token: str

@strawberry.input
class UploadRecordingInput:
    day_number: int
    title: str
    video_url: str
    platform: VideoPlatform
    duration: str
    admin_token: str

@strawberry.input
class MarkProgressInput:
    user_id: str
    day_number: int
    content_type: ContentType

# Query Type
@strawberry.type
class Query:
    @strawberry.field
    async def training_days(self, info) -> List[TrainingDay]:
        """Get all training days"""
        from graphql_api.resolvers import get_all_training_days
        return await get_all_training_days()
    
    @strawberry.field
    async def training_day(self, info, day_number: int) -> Optional[TrainingDay]:
        """Get specific training day"""
        from graphql_api.resolvers import get_training_day
        return await get_training_day(day_number)
    
    @strawberry.field
    async def unlocked_days(self, info) -> List[TrainingDay]:
        """Get only unlocked days"""
        from graphql_api.resolvers import get_unlocked_days
        return await get_unlocked_days()
    
    @strawberry.field
    async def user_progress(self, info, user_id: str) -> List[UserProgress]:
        """Get user's progress"""
        from graphql_api.resolvers import get_user_progress
        return await get_user_progress(user_id)
    
    @strawberry.field
    async def dashboard_stats(self, info, admin_token: str) -> DashboardStats:
        """Get admin dashboard statistics"""
        from graphql_api.resolvers import get_dashboard_stats
        return await get_dashboard_stats(admin_token)

# Mutation Type
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def unlock_day(self, info, input: UnlockDayInput) -> TrainingDay:
        """Admin: Unlock a training day"""
        from graphql_api.resolvers import unlock_training_day
        return await unlock_training_day(input)
    
    @strawberry.mutation
    async def lock_day(self, info, day_number: int, admin_token: str) -> TrainingDay:
        """Admin: Lock a training day"""
        from graphql_api.resolvers import lock_training_day
        return await lock_training_day(day_number, admin_token)
    
    @strawberry.mutation
    async def upload_recording(self, info, input: UploadRecordingInput) -> Recording:
        """Admin: Upload/update recording"""
        from graphql_api.resolvers import upload_recording
        return await upload_recording(input)
    
    @strawberry.mutation
    async def remove_recording(self, info, recording_id: str, admin_token: str) -> bool:
        """Admin: Remove recording"""
        from graphql_api.resolvers import remove_recording
        return await remove_recording(recording_id, admin_token)
    
    @strawberry.mutation
    async def mark_content_viewed(self, info, input: MarkProgressInput) -> UserProgress:
        """Mark content as viewed and track progress"""
        from graphql_api.resolvers import mark_content_viewed
        return await mark_content_viewed(input)

# Subscription Type (Real-time updates)
@strawberry.type
class Subscription:
    @strawberry.subscription
    async def day_unlocked(self, info) -> TrainingDay:
        """Real-time notification when a day is unlocked"""
        # WebSocket subscription implementation
        from graphql_api.subscriptions import day_unlocked_subscription
        async for day in day_unlocked_subscription():
            yield day
    
    @strawberry.subscription
    async def recording_added(self, info) -> Recording:
        """Real-time notification when a recording is added"""
        from graphql_api.subscriptions import recording_added_subscription
        async for recording in recording_added_subscription():
            yield recording

# Create Schema
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)
