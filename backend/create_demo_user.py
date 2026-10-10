import sys
import asyncio
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import AsyncSessionLocal
from app.models import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def create_demo_user():
    async with AsyncSessionLocal() as db:
        # Check if demo user exists
        result = await db.execute(select(User).where(User.email == 'demo@example.com'))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print('? Demo user already exists!')
            print(f'   Email: demo@example.com')
            print(f'   Password: demo123')
            return
        
        # Create demo user
        demo_user = User(
            name='Demo User',
            email='demo@example.com',
            password_hash=get_password_hash('demo123'),
            is_active=True,
            is_verified=True
        )
        
        db.add(demo_user)
        await db.commit()
        
        print('? Demo user created successfully!')
        print(f'   Email: demo@example.com')
        print(f'   Password: demo123')

if __name__ == '__main__':
    asyncio.run(create_demo_user())
