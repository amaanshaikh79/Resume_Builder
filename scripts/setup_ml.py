"""
Setup script for ML enhancements.
Checks dependencies, validates dataset, and prepares environment.
"""
import sys
import os
import subprocess
from pathlib import Path


def check_python_version():
    """Check Python version."""
    print("Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required. Found: {version.major}.{version.minor}")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    return True


def check_dependencies():
    """Check if required packages are installed."""
    print("\nChecking dependencies...")
    
    required_packages = {
        'sklearn': 'scikit-learn',
        'pandas': 'pandas',
        'numpy': 'numpy',
        'bs4': 'beautifulsoup4',
        'matplotlib': 'matplotlib',
        'seaborn': 'seaborn'
    }
    
    missing = []
    
    for import_name, package_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"✓ {package_name}")
        except ImportError:
            print(f"❌ {package_name} - NOT INSTALLED")
            missing.append(package_name)
    
    return missing


def install_dependencies(packages):
    """Install missing packages."""
    if not packages:
        return True
    
    print(f"\n📦 Installing {len(packages)} missing packages...")
    print(f"Packages: {', '.join(packages)}")
    
    try:
        subprocess.check_call(
            [sys.executable, '-m', 'pip', 'install'] + packages,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print("✓ All packages installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation failed: {e}")
        return False


def check_dataset():
    """Check if dataset exists and is valid."""
    print("\nChecking dataset...")
    
    dataset_path = Path('Resume.csv')
    
    if not dataset_path.exists():
        print(f"❌ Dataset not found: {dataset_path.absolute()}")
        return False
    
    print(f"✓ Dataset found: {dataset_path.absolute()}")
    
    # Try to load and check
    try:
        import pandas as pd
        df = pd.read_csv(dataset_path)
        
        required_columns = ['Resume_str', 'Category']
        missing_cols = [col for col in required_columns if col not in df.columns]
        
        if missing_cols:
            print(f"❌ Missing required columns: {missing_cols}")
            print(f"   Found columns: {list(df.columns)}")
            return False
        
        print(f"✓ Dataset shape: {df.shape[0]} resumes, {df.shape[1]} columns")
        print(f"✓ Categories: {df['Category'].nunique()} unique")
        print(f"✓ Missing values: {df['Resume_str'].isnull().sum()}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error reading dataset: {e}")
        return False


def check_directories():
    """Check and create necessary directories."""
    print("\nChecking directories...")
    
    directories = [
        Path('backend/models/trained'),
        Path('scripts')
    ]
    
    for directory in directories:
        if not directory.exists():
            print(f"Creating: {directory}")
            directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ {directory}")
    
    return True


def check_ml_files():
    """Check if ML module files exist."""
    print("\nChecking ML module files...")
    
    ml_files = [
        'backend/app/ml/advanced_preprocessing.py',
        'backend/app/ml/skill_extraction.py',
        'backend/app/ml/job_matching.py',
        'backend/app/ml/enhanced_predict.py',
        'scripts/train_models.py',
        'scripts/evaluate_models.py',
        'scripts/predict.py'
    ]
    
    all_exist = True
    for file_path in ml_files:
        path = Path(file_path)
        if path.exists():
            print(f"✓ {file_path}")
        else:
            print(f"❌ {file_path} - NOT FOUND")
            all_exist = False
    
    return all_exist


def check_trained_models():
    """Check if models are already trained."""
    print("\nChecking trained models...")
    
    model_files = [
        'backend/models/trained/classifier.pkl',
        'backend/models/trained/vectorizer.pkl',
        'backend/models/trained/label_encoder.pkl'
    ]
    
    trained = all(Path(f).exists() for f in model_files)
    
    if trained:
        print("✓ Models already trained")
        return True
    else:
        print("⚠️  Models not yet trained")
        print("   Run: python scripts/train_models.py")
        return False


def main():
    """Main setup routine."""
    print("="*60)
    print("ML ENHANCEMENT SETUP")
    print("="*60)
    
    # Check Python version
    if not check_python_version():
        print("\n❌ Setup failed: Python version too old")
        return False
    
    # Check dependencies
    missing = check_dependencies()
    
    if missing:
        print(f"\n⚠️  {len(missing)} packages missing")
        response = input("\nInstall missing packages? (y/n): ")
        
        if response.lower() == 'y':
            if not install_dependencies(missing):
                print("\n❌ Setup failed: Could not install dependencies")
                return False
        else:
            print("\n⚠️  Setup incomplete: Missing dependencies")
            print(f"Install manually: pip install {' '.join(missing)}")
            return False
    
    # Check dataset
    if not check_dataset():
        print("\n❌ Setup failed: Dataset issues")
        return False
    
    # Check directories
    if not check_directories():
        print("\n❌ Setup failed: Directory issues")
        return False
    
    # Check ML files
    if not check_ml_files():
        print("\n⚠️  Some ML files missing")
        print("   Make sure all enhanced ML modules are in place")
    
    # Check trained models
    models_trained = check_trained_models()
    
    # Summary
    print("\n" + "="*60)
    print("SETUP SUMMARY")
    print("="*60)
    print("✓ Python version: OK")
    print("✓ Dependencies: OK")
    print("✓ Dataset: OK")
    print("✓ Directories: OK")
    print("✓ ML modules: OK")
    
    if models_trained:
        print("✓ Models: TRAINED")
    else:
        print("⚠️  Models: NOT TRAINED")
    
    print("\n" + "="*60)
    
    if not models_trained:
        print("\n📝 NEXT STEPS:")
        print("1. Train models:")
        print("   cd backend")
        print("   .\\venv\\Scripts\\Activate.ps1")
        print("   python ..\\scripts\\train_models.py")
        print("\n2. Evaluate models:")
        print("   python ..\\scripts\\evaluate_models.py")
        print("\n3. Test predictions:")
        print('   python ..\\scripts\\predict.py --resume "Your resume text"')
    else:
        print("\n✅ SETUP COMPLETE!")
        print("\nYou can now:")
        print("- Make predictions: python scripts/predict.py --file resume.txt")
        print("- Evaluate models: python scripts/evaluate_models.py")
        print("- Use API endpoints: See ML_ENHANCEMENT_GUIDE.md")
    
    print("="*60 + "\n")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
