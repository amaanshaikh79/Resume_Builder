import pandas as pd
import re
from typing import Tuple
from bs4 import BeautifulSoup
import numpy as np


def clean_text(text: str) -> str:
    """Clean and normalize resume text"""
    if pd.isna(text) or not isinstance(text, str):
        return ""
    
    # Remove HTML tags
    text = BeautifulSoup(text, "html.parser").get_text()
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep important punctuation
    text = re.sub(r'[^\w\s\.\,\-\+\#]', ' ', text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove extra spaces
    text = text.strip()
    
    return text


def load_and_preprocess_data(csv_path: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Load and preprocess the resume dataset"""
    
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"Original dataset shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Check for missing values
    print(f"\nMissing values:\n{df.isnull().sum()}")
    
    # Remove rows with missing Resume_str or Category
    df = df.dropna(subset=['Resume_str', 'Category'])
    print(f"After removing missing values: {df.shape}")
    
    # Clean the resume text
    print("\nCleaning resume text...")
    df['cleaned_text'] = df['Resume_str'].apply(clean_text)
    
    # Remove empty text after cleaning
    df = df[df['cleaned_text'].str.len() > 50]
    print(f"After removing short resumes: {df.shape}")
    
    # Remove duplicate resumes
    print("\nRemoving duplicates...")
    original_len = len(df)
    df = df.drop_duplicates(subset=['cleaned_text'], keep='first')
    print(f"Removed {original_len - len(df)} duplicates")
    
    # Normalize categories
    df['Category'] = df['Category'].str.upper().str.strip()
    
    # Print category distribution
    print(f"\nCategory distribution:")
    print(df['Category'].value_counts())
    
    # Split features and target
    X = df[['cleaned_text']]
    y = df['Category']
    
    return df, X, y


def get_category_mapping(categories: pd.Series) -> dict:
    """Get mapping of categories to display names"""
    unique_categories = sorted(categories.unique())
    return {cat: cat for cat in unique_categories}
