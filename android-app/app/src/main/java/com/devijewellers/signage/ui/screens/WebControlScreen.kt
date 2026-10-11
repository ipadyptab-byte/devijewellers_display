package com.devijewellers.signage.ui.screens

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.SslErrorHandler
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class WebAppInterface(private val context: Context) {

    private fun decodeBase64ToBytes(base64Data: String): ByteArray {
        val cleanBase64 = if (base64Data.contains("base64,")) {
            base64Data.substringAfter("base64,")
        } else {
            base64Data
        }
        return Base64.decode(cleanBase64, Base64.DEFAULT)
    }

    private fun getShareableUri(base64Data: String, filename: String = "devi_jewellers_rate.png"): Uri? {
        return try {
            val imageBytes = decodeBase64ToBytes(base64Data)
            val imagesDir = File(context.cacheDir, "images")
            if (!imagesDir.exists()) imagesDir.mkdirs()
            val imageFile = File(imagesDir, filename)
            val fos = FileOutputStream(imageFile)
            fos.write(imageBytes)
            fos.flush()
            fos.close()
            FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", imageFile)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Saves image directly to Android device Gallery / Pictures using MediaStore API
     */
    @JavascriptInterface
    fun saveImageToGallery(base64Data: String, filename: String?): String {
        return try {
            val name = if (!filename.isNullOrBlank()) filename else "Devi_Jewellers_Rate_${System.currentTimeMillis()}.png"
            val imageBytes = decodeBase64ToBytes(base64Data)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val resolver = context.contentResolver
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, name)
                    put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/DeviJewellers")
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }

                val imageUri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
                if (imageUri != null) {
                    val out: OutputStream? = resolver.openOutputStream(imageUri)
                    out?.use { it.write(imageBytes) }
                    contentValues.clear()
                    contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                    resolver.update(imageUri, contentValues, null, null)
                }
            } else {
                val picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                val deviDir = File(picturesDir, "DeviJewellers")
                if (!deviDir.exists()) deviDir.mkdirs()
                val destFile = File(deviDir, name)
                val fos = FileOutputStream(destFile)
                fos.write(imageBytes)
                fos.flush()
                fos.close()

                val values = ContentValues().apply {
                    put(MediaStore.Images.Media.DATA, destFile.absolutePath)
                    put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                }
                context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
            }

            android.os.Handler(android.os.Looper.getMainLooper()).post {
                Toast.makeText(context, "Image saved to Gallery / Pictures successfully!", Toast.LENGTH_LONG).show()
            }
            "SUCCESS"
        } catch (e: Exception) {
            e.printStackTrace()
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                Toast.makeText(context, "Error saving image: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
            "ERROR: ${e.message}"
        }
    }

    /**
     * Share image to Regular WhatsApp (com.whatsapp)
     */
    @JavascriptInterface
    fun shareToWhatsApp(base64Data: String, caption: String?) {
        shareImage(base64Data, "Devi Jewellers Today's Rates", caption ?: "", "com.whatsapp")
    }

    /**
     * Share image to WhatsApp Business (com.whatsapp.w4b)
     */
    @JavascriptInterface
    fun shareToWhatsAppBusiness(base64Data: String, caption: String?) {
        shareImage(base64Data, "Devi Jewellers Today's Rates", caption ?: "", "com.whatsapp.w4b")
    }

    /**
     * General Share Image with fallback if specified app package is not installed
     */
    @JavascriptInterface
    fun shareImage(base64Data: String, title: String, text: String, pkg: String?) {
        try {
            val uri = getShareableUri(base64Data) ?: throw Exception("Failed to generate shareable file URI")

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, uri)
                if (title.isNotEmpty()) {
                    putExtra(Intent.EXTRA_TITLE, title)
                }
                if (text.isNotEmpty()) {
                    putExtra(Intent.EXTRA_TEXT, text)
                }
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                if (!pkg.isNullOrEmpty()) {
                    setPackage(pkg)
                }
            }

            // Check if intended package can handle it
            val packageManager = context.packageManager
            val canResolve = if (!pkg.isNullOrEmpty()) {
                shareIntent.resolveActivity(packageManager) != null
            } else false

            if (!pkg.isNullOrEmpty() && !canResolve) {
                // If specific whatsapp/whatsapp-business is not installed, notify user and open general chooser
                val appLabel = if (pkg.contains("w4b")) "WhatsApp Business" else "WhatsApp"
                android.os.Handler(android.os.Looper.getMainLooper()).post {
                    Toast.makeText(context, "$appLabel is not installed on this device. Choose an app to share:", Toast.LENGTH_SHORT).show()
                }
                shareIntent.setPackage(null)
            }

            val chooser = Intent.createChooser(shareIntent, title.ifEmpty { "Share Image" }).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
        } catch (e: Exception) {
            e.printStackTrace()
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                Toast.makeText(context, "Could not share: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebControlScreen(url: String = "https://devijewellers-display.vercel.app/") {
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var subPageCanGoBack by remember { mutableStateOf(false) }

    var fileChooserCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }

    val fileChooserLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val data = result.data
        if (result.resultCode == Activity.RESULT_OK && data != null) {
            val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, data)
            fileChooserCallback?.onReceiveValue(uris)
        } else {
            fileChooserCallback?.onReceiveValue(null)
        }
        fileChooserCallback = null
    }

    BackHandler(enabled = subPageCanGoBack) {
        webViewRef?.goBack()
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                webViewRef = this
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.databaseEnabled = true
                settings.cacheMode = WebSettings.LOAD_DEFAULT // standard caching helps SPAs
                settings.loadsImagesAutomatically = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                settings.mediaPlaybackRequiresUserGesture = false
                settings.javaScriptCanOpenWindowsAutomatically = true
                
                addJavascriptInterface(WebAppInterface(context), "AndroidNative")

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }
                
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        val uri = request?.url ?: return false
                        val urlStr = uri.toString()
                        if (urlStr.startsWith("whatsapp:") || urlStr.startsWith("intent:") || urlStr.startsWith("tel:") || urlStr.startsWith("mailto:")) {
                            try {
                                val intent = Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME).apply {
                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                }
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                            return true
                        }
                        // Return false to let the WebView handle normal HTTP/HTTPS URL navigation natively
                        return false
                    }

                    @Deprecated("Deprecated in Java")
                    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                        if (url == null) return false
                        if (url.startsWith("whatsapp:") || url.startsWith("intent:") || url.startsWith("tel:") || url.startsWith("mailto:")) {
                            try {
                                val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME).apply {
                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                }
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                            return true
                        }
                        return false
                    }

                    override fun onReceivedSslError(
                        view: WebView?,
                        handler: SslErrorHandler?,
                        error: SslError?
                    ) {
                        handler?.proceed() // Ignore SSL certificate errors just in case
                    }

                    override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
                        subPageCanGoBack = view?.canGoBack() ?: false
                        super.doUpdateVisitedHistory(view, url, isReload)
                    }
                }
                webChromeClient = object : WebChromeClient() {
                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        // Optional: Log console messages for debugging
                        return super.onConsoleMessage(consoleMessage)
                    }

                    override fun onShowFileChooser(
                        webView: WebView?,
                        filePathCallback: ValueCallback<Array<Uri>>?,
                        fileChooserParams: FileChooserParams?
                    ): Boolean {
                        fileChooserCallback?.onReceiveValue(null) // cancel any previous
                        fileChooserCallback = filePathCallback
                        
                        try {
                            val intent = fileChooserParams?.createIntent()
                            if (intent != null) {
                                fileChooserLauncher.launch(intent)
                                return true
                            }
                        } catch (e: Exception) {
                            fileChooserCallback?.onReceiveValue(null)
                            fileChooserCallback = null
                        }
                        return false
                    }
                }
                
                loadUrl(url)
            }
        },
        update = { webView ->
            // Update logic not required for static URL.
        }
    )
}
