from setuptools import setup, find_packages

setup(
    name="song-pipeline",
    version="0.1.0",
    description="Gaudiya Kirtan song conversion pipeline",
    author="GK Team",
    packages=find_packages(),
    install_requires=[
        "typing-extensions>=4.0.0",
        "pyyaml>=6.0",
    ],
    python_requires=">=3.7",
)