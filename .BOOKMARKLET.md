# NetSurfer Bookmarklet

## Installation

1. Copy the JavaScript code below
2. Create a new bookmark in your browser
3. Set the name to "Add to NetSurfer"
4. Paste the code as the URL

## Bookmarklet Code

```javascript
javascript:(function(){
  var url=encodeURIComponent(window.location.href);
  var title=encodeURIComponent(document.title);
  window.open('http://localhost:3000/command.php?command=Add%20Link&url='+url+'&name='+title,'_blank');
})();
```

## Alternative Version (popup)

This version opens in a smaller popup window:

```javascript
javascript:(function(){
  var url=encodeURIComponent(window.location.href);
  var title=encodeURIComponent(document.title);
  window.open('http://localhost:3000/command.php?command=Add%20Link&url='+url+'&name='+title,'netsurfer','width=600,height=500,scrollbars=yes,resizable=yes');
})();
```

## Usage

1. Navigate to any webpage you want to bookmark
2. Click the "Add to NetSurfer" bookmark
3. The Add Link form will open with the page's URL and title pre-filled
4. Log in if prompted
5. Add tags and description, then save

## Benefits over SiteBar Addon

- Works in any browser
- No extension installation required
- More reliable (no addon conflicts)
- Opens in new tab/popup (doesn't interrupt your browsing)
- Pre-fills URL and title automatically

## Troubleshooting

If the bookmarklet doesn't work:

1. Make sure your development server is running on http://localhost:3000
2. Check browser console for any errors
3. Ensure popup blockers aren't blocking the new window
4. Try the regular version (not popup) if popup is blocked
