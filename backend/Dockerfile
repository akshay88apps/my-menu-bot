# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set the working directory in the container
WORKDIR /app

# Install any needed packages specified in requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Ensure the menu data is in the correct place for the app
# If final_structured_menu.csv is in the same directory as Dockerfile,
# then COPY . . handles it.

# Expose the port that Gunicorn will listen on
EXPOSE 8080

# Run Gunicorn when the container launches
ENTRYPOINT ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
