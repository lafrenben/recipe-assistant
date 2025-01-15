# Recipe Assistant

## Setup

**Set your OpenAI API key**

Create a file named `.env` in the root of the project with one line:

```sh
OPENAI_KEY=<YOUR_KEY_HERE>
```

**Install python dependencies (for the backend server)**
```sh
poetry install
```

**Install js/React dependencies (for the web frontend)**
```sh
cd frontend
npm install
```

## Running the project

**Start the backend server**
```sh
# In root directory
python server.py
```

**Start the web frontend**
```sh
# In the 'frontend' directory
npm run start
```
