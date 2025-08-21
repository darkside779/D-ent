<img width="7840" height="4150" alt="image" src="https://github.com/user-attachments/assets/65b3a91e-6e12-4b99-9ffe-a68f8ac41510" /># SmartExtract Pro

SmartExtract Pro is an intelligent document processing system that automates data extraction from various document types using customizable templates and AI-powered data recognition.

## Features

- **Document Management**: Upload, view, and manage documents in various formats
- **Template System**: Create custom templates for different document types
- **AI-Powered Extraction**: Automatically extract structured data from documents
- **User Authentication**: Secure user management and access control
- **RESTful API**: Modern API for integration with other systems

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy
- SQLite (can be configured to use PostgreSQL/MySQL)
- Pydantic for data validation

### Frontend
- React.js
- TypeScript
- Material-UI (MUI)
- React Hook Form
- Redux Toolkit

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate



Install dependencies:
bash
cd backend
pip install -r requirements.txt
Set up environment variables:
bash
cp .env.example .env
# Edit .env with your configuration
Initialize the database:
bash
python -m app.db.init_db
Run the development server:
bash
uvicorn app.main:app --reload
Frontend Setup
Install dependencies:
bash
cd frontend
npm install
# or
yarn install
Set up environment variables:
bash
cp .env.example .env.local
# Edit .env.local with your API endpoint
Start the development server:


bash
npm start

# or

yarn start

## API Documentation

Once the backend server is running, you can access:

- **Interactive API docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative API docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure



smartextract-pro/ ├── backend/ # Backend source code │ ├── app/ # Application code │ │ ├── api/ # API routes │ │ ├── core/ # Core functionality │ │ ├── crud/ # Database operations │ │ ├── db/ # Database configuration │ │ ├── models/ # Database models │ │ └── schemas/ # Pydantic models │ └── requirements.txt # Python dependencies │ ├── frontend/ # Frontend React application │ ├── public/ # Static files │ └── src/ # Source code │ ├── components/ # Reusable components │ ├── pages/ # Page components │ ├── services/ # API services │ └── App.tsx # Main application component │ └── README.md # This file


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
