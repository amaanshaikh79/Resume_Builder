"""
Advanced preprocessing for resume text with comprehensive cleaning
"""
import pandas as pd
import re
import numpy as np
from bs4 import BeautifulSoup
from typing import Tuple, Dict
import hashlib


def clean_html(text: str) -> str:
    """Remove HTML tags and entities"""
    if pd.isna(text) or not isinstance(text, str):
        return ""
    
    # Parse HTML and extract text
    soup = BeautifulSoup(text, "html.parser")
    text = soup.get_text()
    
    # Remove HTML entities
    text = re.sub(r'&[a-z]+;', ' ', text)
    
    return text


def normalize_text(text: str) -> str:
    """Normalize text with advanced cleaning"""
    if pd.isna(text) or not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', ' ', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', ' email ', text)
    
    # Remove phone numbers
    text = re.sub(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', ' phone ', text)
    
    # Keep important characters, remove others
    text = re.sub(r'[^\w\s\.\,\-\+\#]', ' ', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove extra spaces
    text = text.strip()
    
    return text


def extract_skills_keywords(text: str) -> list:
    """Extract potential skills from resume text"""
    # Common technical skills and tools
    tech_skills = [
        'python', 'java', 'javascript', 'react', 'angular', 'node',
        'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure',
        'docker', 'kubernetes', 'git', 'linux', 'windows',
        'machine learning', 'deep learning', 'ai', 'data science',
        'html', 'css', 'php', 'ruby', 'go', 'rust', 'swift',
        'android', 'ios', 'tensorflow', 'pytorch', 'scikit-learn'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in tech_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return found_skills


def calculate_text_stats(text: str) -> Dict:
    """Calculate text statistics"""
    words = text.split()
    return {
        'word_count': len(words),
        'char_count': len(text),
        'avg_word_length': np.mean([len(w) for w in words]) if words else 0,
        'sentence_count': len(re.findall(r'[.!?]+', text))
    }


def load_and_analyze_data(csv_path: str, verbose: bool = True) -> Tuple[pd.DataFrame, Dict]:
    """
    Load and analyze the resume dataset
    
    Returns:
        DataFrame and analysis dictionary
    """
    if verbose:
        print("=" * 70)
        print("DATASET ANALYSIS")
        print("=" * 70)
    
    # Load data
    df = pd.read_csv(csv_path)
    
    if verbose:
        print(f"\n📊 Dataset Shape: {df.shape}")
        print(f"   Rows: {df.shape[0]:,}")
        print(f"   Columns: {df.shape[1]}")
    
    # Check missing values
    missing = df.isnull().sum()
    if verbose:
        print(f"\n❓ Missing Values:")
        for col, count in missing.items():
            if count > 0:
                print(f"   {col}: {count} ({count/len(df)*100:.2f}%)")
        if missing.sum() == 0:
            print("   None - Perfect dataset!")
    
    # Check duplicates
    duplicate_count = df.duplicated(subset=['Resume_str']).sum()
    if verbose:
        print(f"\n🔄 Duplicates:")
        print(f"   Resume_str duplicates: {duplicate_count}")
    
    # Remove duplicates
    df = df.drop_duplicates(subset=['Resume_str'], keep='first')
    
    if verbose and duplicate_count > 0:
        print(f"   Removed {duplicate_count} duplicates")
        print(f"   New shape: {df.shape}")
    
    # Category analysis
    category_dist = df['Category'].value_counts()
    
    if verbose:
        print(f"\n📂 Categories:")
        print(f"   Total unique categories: {df['Category'].nunique()}")
        print(f"   Most common: {category_dist.index[0]} ({category_dist.iloc[0]})")
        print(f"   Least common: {category_dist.index[-1]} ({category_dist.iloc[-1]})")
        print(f"   Average per category: {len(df) / df['Category'].nunique():.1f}")
    
    # Text quality analysis
    df['text_length'] = df['Resume_str'].str.len()
    
    if verbose:
        print(f"\n📝 Text Quality:")
        print(f"   Min length: {df['text_length'].min():,} chars")
        print(f"   Max length: {df['text_length'].max():,} chars")
        print(f"   Mean length: {df['text_length'].mean():,.0f} chars")
        print(f"   Median length: {df['text_length'].median():,.0f} chars")
    
    # Check for very short resumes
    short_resumes = (df['text_length'] < 100).sum()
    if verbose and short_resumes > 0:
        print(f"   ⚠️  Very short resumes (<100 chars): {short_resumes}")
    
    # Class imbalance analysis
    max_count = category_dist.max()
    min_count = category_dist.min()
    imbalance_ratio = max_count / min_count
    
    if verbose:
        print(f"\n⚖️  Class Balance:")
        print(f"   Imbalance ratio: {imbalance_ratio:.2f}:1")
        if imbalance_ratio > 5:
            print(f"   ⚠️  Significant imbalance detected!")
        else:
            print(f"   ✓ Relatively balanced dataset")
    
    # Create analysis dict
    analysis = {
        'total_records': len(df),
        'num_categories': df['Category'].nunique(),
        'duplicates_removed': duplicate_count,
        'category_distribution': category_dist.to_dict(),
        'imbalance_ratio': imbalance_ratio,
        'text_stats': {
            'min_length': int(df['text_length'].min()),
            'max_length': int(df['text_length'].max()),
            'mean_length': int(df['text_length'].mean()),
            'median_length': int(df['text_length'].median())
        },
        'dataset_hash': hashlib.md5(pd.util.hash_pandas_object(df).values).hexdigest()
    }
    
    if verbose:
        print(f"\n✅ Analysis complete!")
        print("=" * 70)
    
    return df, analysis


def preprocess_pipeline(df: pd.DataFrame, verbose: bool = True) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    """
    Complete preprocessing pipeline
    
    Returns:
        cleaned_df, X (features), y (target)
    """
    if verbose:
        print("\n" + "=" * 70)
        print("PREPROCESSING PIPELINE")
        print("=" * 70)
    
    df = df.copy()
    
    # Step 1: Clean HTML
    if verbose:
        print("\n🧹 Step 1: Cleaning HTML tags...")
    df['cleaned_text'] = df['Resume_str'].apply(clean_html)
    
    # Step 2: Normalize text
    if verbose:
        print("🧹 Step 2: Normalizing text...")
    df['cleaned_text'] = df['cleaned_text'].apply(normalize_text)
    
    # Step 3: Remove very short resumes
    original_len = len(df)
    df = df[df['cleaned_text'].str.len() >= 50]
    removed = original_len - len(df)
    
    if verbose and removed > 0:
        print(f"🧹 Step 3: Removed {removed} very short resumes (<50 chars)")
    
    # Step 4: Remove empty after cleaning
    df = df[df['cleaned_text'].str.strip() != '']
    
    # Step 5: Normalize categories
    if verbose:
        print("🧹 Step 4: Normalizing categories...")
    df['Category'] = df['Category'].str.upper().str.strip()
    
    # Extract features and target
    X = df['cleaned_text']
    y = df['Category']
    
    if verbose:
        print(f"\n✅ Preprocessing complete!")
        print(f"   Final dataset size: {len(df):,} resumes")
        print(f"   Ready for model training")
        print("=" * 70)
    
    return df, X, y
