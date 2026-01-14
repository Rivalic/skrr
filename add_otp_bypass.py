#!/usr/bin/env python3
"""
Add OTP bypass functionality to Swiggy IPA
"""

import os
import sys
import shutil
import zipfile

def add_otp_bypass_to_ipa(ipa_path, output_ipa=None):
    """Add OTP bypass scripts to IPA"""
    
    if output_ipa is None:
        output_ipa = ipa_path.replace('.ipa', '_otp_bypass.ipa').replace('.zip', '_otp_bypass.ipa')
    
    extract_dir = "temp_otp_bypass"
    
    # Clean up
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    
    print(f"Extracting IPA: {ipa_path}")
    with zipfile.ZipFile(ipa_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    
    # Find app bundle
    app_bundle = None
    payload_dir = os.path.join(extract_dir, "Payload")
    
    if os.path.exists(payload_dir):
        for item in os.listdir(payload_dir):
            if item.endswith('.app'):
                app_bundle = os.path.join(payload_dir, item)
                break
    
    if not app_bundle:
        if os.path.exists(os.path.join(extract_dir, "Info.plist")):
            app_bundle = extract_dir
    
    if not app_bundle:
        # Last resort: use extracted directory if it has app-like structure
        if os.path.exists(os.path.join(extract_dir, "Info.plist")):
            app_bundle = extract_dir
        else:
            raise Exception("Could not find .app bundle")
    
    print(f"Found app bundle: {os.path.basename(app_bundle)}")
    
    # Ensure config/inject directory exists
    inject_dir = os.path.join(app_bundle, "config", "inject")
    os.makedirs(inject_dir, exist_ok=True)
    
    # Copy OTP bypass script
    otp_script = "extracted/config/inject/otp_bypass.js"
    if os.path.exists(otp_script):
        target_script = os.path.join(inject_dir, "otp_bypass.js")
        shutil.copy2(otp_script, target_script)
        print(f"[OK] Added OTP bypass script: {target_script}")
    else:
        # Create inline
        script_content = open("extracted/config/inject/otp_bypass.js", 'r', encoding='utf-8').read()
        target_script = os.path.join(inject_dir, "otp_bypass.js")
        with open(target_script, 'w', encoding='utf-8') as f:
            f.write(script_content)
        print(f"[OK] Created OTP bypass script: {target_script}")
    
    # Copy OTP bypass button script
    otp_button_script = "extracted/config/inject/otp_bypass_button.js"
    if os.path.exists(otp_button_script):
        target_button_script = os.path.join(inject_dir, "otp_bypass_button.js")
        shutil.copy2(otp_button_script, target_button_script)
        print(f"[OK] Added OTP bypass button script: {target_button_script}")
    else:
        # Create inline
        button_script_content = open("extracted/config/inject/otp_bypass_button.js", 'r', encoding='utf-8').read()
        target_button_script = os.path.join(inject_dir, "otp_bypass_button.js")
        with open(target_button_script, 'w', encoding='utf-8') as f:
            f.write(button_script_content)
        print(f"[OK] Created OTP bypass button script: {target_button_script}")
    
    # Update custom.js to load OTP bypass
    custom_js = os.path.join(inject_dir, "custom.js")
    if os.path.exists(custom_js):
        with open(custom_js, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'otp_bypass' not in content.lower():
            loader = "\n\n// Load OTP bypass scripts\n"
            loader += "if (typeof window !== 'undefined') {\n"
            loader += "    // Load main bypass script\n"
            loader += "    const otpScript = document.createElement('script');\n"
            loader += "    otpScript.src = 'config/inject/otp_bypass.js';\n"
            loader += "    otpScript.onload = function() { console.log('[OTPBypass] Main script loaded'); };\n"
            loader += "    document.head.appendChild(otpScript);\n"
            loader += "    \n"
            loader += "    // Load button script\n"
            loader += "    const buttonScript = document.createElement('script');\n"
            loader += "    buttonScript.src = 'config/inject/otp_bypass_button.js';\n"
            loader += "    buttonScript.onload = function() { console.log('[OTPBypass] Button script loaded'); };\n"
            loader += "    document.head.appendChild(buttonScript);\n"
            loader += "}\n"
            
            with open(custom_js, 'a', encoding='utf-8') as f:
                f.write(loader)
            print(f"[OK] Updated custom.js to load OTP bypass")
    
    # Repackage IPA
    print(f"Repackaging IPA: {output_ipa}")
    
    if os.path.exists(output_ipa):
        os.remove(output_ipa)
    
    app_name = os.path.basename(app_bundle)
    
    with zipfile.ZipFile(output_ipa, 'w', zipfile.ZIP_DEFLATED) as zipf:
        if os.path.exists(payload_dir):
            for root, dirs, files in os.walk(payload_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.join("Payload", os.path.relpath(file_path, payload_dir))
                    zipf.write(file_path, arcname)
    
    print(f"[OK] IPA repackaged: {output_ipa}")
    
    # Cleanup
    shutil.rmtree(extract_dir)
    
    return output_ipa

def main():
    if len(sys.argv) < 2:
        print("Usage: python add_otp_bypass.py <ipa_file> [output_ipa]")
        print("Example: python add_otp_bypass.py swiggy_with_reset_button.ipa swiggy_otp_bypass.ipa")
        sys.exit(1)
    
    ipa_path = sys.argv[1]
    output_ipa = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(ipa_path):
        print(f"Error: IPA file not found: {ipa_path}")
        sys.exit(1)
    
    try:
        result = add_otp_bypass_to_ipa(ipa_path, output_ipa)
        print(f"\n[SUCCESS] OTP bypass added to: {result}")
        print("\nHow to use:")
        print("1. Install the IPA on your device")
        print("2. When you see 'Too many login attempts' error:")
        print("   - Look for 'Bypass Restriction' button (top-right)")
        print("   - Or the script will auto-bypass the restriction")
        print("3. You can now retry OTP verification")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
