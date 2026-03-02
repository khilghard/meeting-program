package com.qrscanner.app

import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebSettings
import android.webkit.WebViewClient
import android.webkit.ValueCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    companion object {
        private const val CAMERA_PERMISSION_REQUEST = 100
        private const val FILECHOOSER_REQUEST = 200
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)

        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.databaseEnabled = true
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        webSettings.mediaPlaybackRequiresUserGesture = false

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                if (ContextCompat.checkSelfPermission(this@MainActivity, android.Manifest.permission.CAMERA) 
                    == PackageManager.PERMISSION_GRANTED) {
                    request.grant(request.resources)
                } else {
                    ActivityCompat.requestPermissions(
                        this@MainActivity,
                        arrayOf(android.Manifest.permission.CAMERA),
                        CAMERA_PERMISSION_REQUEST
                    )
                    pendingPermissionRequest = request
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: WebChromeClient.FileChooserParams?
            ): Boolean {
                pendingFileUploads = filePathCallback
                val intent = fileChooserParams?.createIntent() ?: android.content.Intent(
                    android.content.Intent.ACTION_GET_CONTENT
                ).apply {
                    addCategory(android.content.Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                }
                this@MainActivity.startActivityForResult(
                    android.content.Intent.createChooser(intent, "Select QR Image"),
                    FILECHOOSER_REQUEST
                )
                return true
            }
        }

        webView.webViewClient = WebViewClient()

        webView.loadUrl("file:///android_asset/index.html")
    }

    private var pendingPermissionRequest: PermissionRequest? = null
    private var pendingFileUploads: ValueCallback<Array<Uri>>? = null

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: android.content.Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILECHOOSER_REQUEST) {
            if (resultCode == RESULT_OK) {
                data?.data?.let { uri ->
                    pendingFileUploads?.onReceiveValue(arrayOf(uri))
                } ?: run {
                    pendingFileUploads?.onReceiveValue(arrayOf())
                }
            } else {
                pendingFileUploads?.onReceiveValue(arrayOf())
            }
            pendingFileUploads = null
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                pendingPermissionRequest?.grant(pendingPermissionRequest!!.resources)
            }
            pendingPermissionRequest = null
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
