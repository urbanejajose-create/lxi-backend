# LXI Backend - Production Configuration

## Deployment Entry Point

`server_v2.py` is the real application.

`server.py` is now only a compatibility wrapper that re-exports `app` from
`server_v2.py`, so old deploy commands using `server:app` still start the v2 API.

### Important: Backup Your Data!

```bash
# Before production work, backup your MongoDB
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/db_name" --out ./backup
```

### Steps Before Go-Live

1. **Update dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create database indexes and seed data**
   ```bash
   python seed_data.py
   ```

3. **Test the server**
   ```bash
   pytest test_server.py -v
   ```

4. **Start the server**
   ```bash
   uvicorn server_v2:app --reload --port 8000
   ```

---

## New Features in v2

| Feature | Old | New |
|---------|-----|-----|
| User Auth | ❌ | ✅ |
| User Profiles | ❌ | ✅ |
| Product CRUD | 🟡 (hardcoded) | ✅ (DB) |
| Wishlist | ❌ | ✅ |
| Reviews | ❌ | ✅ |
| Search & Filter | ❌ | ✅ |
| Admin Endpoints | 🟡 (limited) | ✅ |
| Rate Limiting | ❌ | ✅ |
| Tests | ❌ | ✅ |
| Docs | 🟡 (README) | ✅ |

---

## Configuration

### Environment Setup

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

### Required Variables

```env
# MongoDB (CRITICAL)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=lxi_ecommerce

# Security (CRITICAL)
SECRET_KEY=your-super-secret-key-min-32-chars
STRIPE_API_KEY=sk_test_...

# CORS (Set to your frontend URL in production)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## Running the Server

### Development

```bash
# With auto-reload
uvicorn server_v2:app --reload --port 8000

# With verbose logging
uvicorn server_v2:app --reload --log-level debug --port 8000
```

### Production

```bash
# Single worker
uvicorn server_v2:app --host 0.0.0.0 --port 8000

# Multi-worker (gunicorn)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server_v2:app

# With environment variables
WORKERS=4 uvicorn server_v2:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Docker Setup

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run app
CMD ["uvicorn", "server_v2:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      MONGO_URL: ${MONGO_URL}
      DB_NAME: ${DB_NAME}
      SECRET_KEY: ${SECRET_KEY}
      STRIPE_API_KEY: ${STRIPE_API_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

### Build & Run with Docker

```bash
# Build image
docker build -t lxi-api:latest .

# Run container
docker run -p 8000:8000 \
  -e MONGO_URL="mongodb+srv://..." \
  -e SECRET_KEY="..." \
  -e STRIPE_API_KEY="..." \
  lxi-api:latest

# With docker-compose
docker-compose up -d
```

---

## Monitoring & Logging

### Log Files

```bash
# View logs (development)
tail -f logs/app.log

# Real-time logs
docker-compose logs -f api
```

### Health Check

```bash
# Quick health check
curl http://localhost:8000/api/health

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/auth/me
```

### Performance Monitoring

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/products

# Using wrk
wrk -t4 -c100 -d30s http://localhost:8000/api/products
```

---

## Database Maintenance

### Create Indexes

```bash
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def create_indexes():
    client = AsyncIOMotorClient('your_mongo_url')
    db = client['lxi_ecommerce']
    
    await db.products.create_index('category')
    await db.products.create_index([('name', 'text'), ('description', 'text')])
    await db.reviews.create_index('product_id')
    await db.wishlist.create_index('user_id')
    
    print('Indexes created')

asyncio.run(create_indexes())
"
```

### Backup Database

```bash
# Dump database
mongodump --uri='mongodb+srv://user:pass@cluster.mongodb.net/db' \
  --out ./backups/lxi_$(date +%Y%m%d)

# Restore from backup
mongorestore --uri='mongodb+srv://user:pass@cluster.mongodb.net/db' \
  --dir ./backups/lxi_20260319
```

---

## Troubleshooting

### Common Issues

**1. Connection Refused Error**
```
Solution: Check MONGO_URL and network connectivity
- Verify MongoDB connection string
- Ensure whitelisted IP address
- Check firewall settings
```

**2. JWT Token Expired**
```
Solution: User needs to login again
- Token expires after 24 hours
- Frontend should handle token refresh
- Check system clock synchronization
```

**3. CORS Error**
```
Solution: Update CORS_ORIGINS in .env
- Add your frontend URL
- Restart the server
- Check console for exact error
```

**4. Rate Limit Exceeded**
```
Log: "429 Too Many Requests"
Solution:
- Wait for rate limit window to pass
- For testing, temporarily disable in slowapi
```

**5. Database Connection Pool Error**
```
Solution: Increase connection pool size
- Add to MONGO_URL: ?maxPoolSize=50
- Increase hardware resources
- Scale horizontally with load balancer
```

---

## Performance Tuning

### FastAPI Optimization

```python
# In server.py, adjust if needed
WORKERS = 4  # CPU cores
MAX_CONNECTIONS = 100  # DB connections
REQUEST_TIMEOUT = 60  # seconds
```

### MongoDB Optimization

```javascript
// In MongoDB, analyze slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5).pretty()
```

### Load Testing

```bash
# Using locust
pip install locust

# Create locustfile.py and run
locust -f locustfile.py --host=http://localhost:8000
```

---

## Security Checklist

- [ ] Change SECRET_KEY from default
- [ ] Set CORS_ORIGINS to specific domain
- [ ] Enable HTTPS in production
- [ ] Use strong MongoDB passwords
- [ ] Configure Stripe keys (test → production)
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Regular backups enabled
- [ ] Monitoring/alerting configured
- [ ] OWASP security headers set

---

## API Key Management

### Stripe Keys

```bash
# Test mode (development)
STRIPE_API_KEY=sk_test_xxxxx

# Production mode (production)
STRIPE_API_KEY=sk_live_xxxxx

# Keep webhook secret secure
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### JWT Secret

```bash
# Generate strong secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Use in .env
SECRET_KEY=your-generated-secret-here
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-25 | Initial API |
| 1.5 | 2026-03-10 | Added products |
| 2.0 | 2026-03-19 | Complete rewrite - 100% feature set |

---

## Support & References

- **API Docs**: http://localhost:8000/docs
- **Documentation**: See API_DOCUMENTATION.md
- **Architecture**: See ARCHITECTURE.md
- **Tests**: pytest test_server.py -v

---

**Last Updated**: March 19, 2026  
**API Version**: 2.0.0
