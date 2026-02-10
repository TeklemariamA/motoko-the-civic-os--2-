# YML File Upload to Hosting Service

This document describes the automated upload of GitHub Actions workflow files to the hosting service.

## Overview

The `upload-yml-hosting.yml` workflow automatically uploads all `.yml` workflow files to the Civic-Os hosting location whenever changes are pushed to the main branch.

## Target Location

**Hosting Service:** Hostinger  
**Server:** srv1163-files.hstgr.io  
**Upload Path:** /public_html/Civic-Os/  
**Access URL:** https://srv1163-files.hstgr.io/bf74c39f6227ae6c/files/public_html/Civic-Os/

## Workflow Details

### Triggers
- Push to `main` branch (when `.github/workflows/*.yml` files change)
- Manual workflow dispatch

### What it does
1. Checks out the repository
2. Copies all `.yml` files from `.github/workflows/` to a temporary directory
3. Uploads them to the hosting server via FTP
4. Verifies the upload

### Files Uploaded
- datadog-synthetics.yml
- docker-push.yml
- generator-generic-ossf-slsa3-publish.yml
- ic-deploy.yml
- node.js.yml
- npm-publish.yml
- pages-deploy.yml
- upload-yml-hosting.yml (this workflow itself)

## Required Secrets

To enable automated upload, configure the following GitHub secrets:

### FTP_USERNAME
The FTP username for accessing the hosting server.

### FTP_PASSWORD
The FTP password for authentication.

## Setup Instructions

1. **Obtain FTP Credentials**
   - Log in to your Hostinger control panel
   - Navigate to Files → FTP Accounts
   - Create or use existing FTP account credentials

2. **Add GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add `FTP_USERNAME` with your FTP username
   - Add `FTP_PASSWORD` with your FTP password

3. **Test the Workflow**
   - Make a change to any `.yml` file in `.github/workflows/`
   - Commit and push to main branch
   - Or manually trigger via Actions → Upload YML Files to Hosting → Run workflow

## Manual Upload

If you need to upload files manually, you can use any FTP client:

### Using FileZilla
```
Host: srv1163-files.hstgr.io
Username: [Your FTP username]
Password: [Your FTP password]
Port: 21 (or 22 for SFTP)
```

Upload the `.yml` files to: `/public_html/Civic-Os/`

### Using Command Line (lftp)
```bash
lftp -u username,password srv1163-files.hstgr.io
cd /public_html/Civic-Os/
mput .github/workflows/*.yml
quit
```

### Using cURL (if HTTP upload is enabled)
```bash
for file in .github/workflows/*.yml; do
  curl -T "$file" ftp://srv1163-files.hstgr.io/public_html/Civic-Os/ \
    --user username:password
done
```

## Verification

After upload, you can verify the files are accessible at:
```
https://srv1163-files.hstgr.io/bf74c39f6227ae6c/files/public_html/Civic-Os/[filename].yml
```

For example:
- https://srv1163-files.hstgr.io/bf74c39f6227ae6c/files/public_html/Civic-Os/docker-push.yml
- https://srv1163-files.hstgr.io/bf74c39f6227ae6c/files/public_html/Civic-Os/ic-deploy.yml

## Troubleshooting

### Upload Fails
1. Verify FTP credentials are correct
2. Check if the target directory exists on the server
3. Ensure FTP access is enabled in Hostinger control panel
4. Review GitHub Actions logs for specific error messages

### Files Not Accessible
1. Check file permissions on the server
2. Verify the URL path is correct
3. Ensure the hosting service allows public access to uploaded files

### Alternative: SFTP
If FTP doesn't work, you can modify the workflow to use SFTP:
```yaml
- name: Upload via SFTP
  uses: wlixcc/SFTP-Deploy-Action@v1.2.4
  with:
    server: srv1163-files.hstgr.io
    username: ${{ secrets.SFTP_USERNAME }}
    password: ${{ secrets.SFTP_PASSWORD }}
    local_path: './upload_temp/*'
    remote_path: '/public_html/Civic-Os/'
    sftp_only: true
```

## Security Considerations

- FTP credentials are stored as GitHub Secrets (encrypted)
- Workflow has minimal permissions (`contents: read`)
- Only `.yml` files from `.github/workflows/` are uploaded
- No sensitive data should be in workflow files

## Maintenance

To update the upload configuration:
1. Edit `.github/workflows/upload-yml-hosting.yml`
2. Modify the `server-dir` or `local-dir` paths as needed
3. Commit and push changes
