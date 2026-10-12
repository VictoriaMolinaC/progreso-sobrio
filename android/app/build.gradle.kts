import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

// Firma de release: rutas y contraseñas en android/keystore.properties (ignorado en Git; la llave
// .jks vive fuera del repo). Si el archivo no existe, debug y los tests funcionan igual y la
// release sale sin firmar.
val keystorePropsFile = rootProject.file("keystore.properties")
val keystoreProps = Properties().apply {
    if (keystorePropsFile.exists()) keystorePropsFile.inputStream().use { load(it) }
}
fun keystoreProp(name: String): String =
    keystoreProps.getProperty(name) ?: throw GradleException("Falta '$name' en keystore.properties")

android {
    namespace = "cl.progresosobrio.app"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "cl.progresosobrio.app"
        minSdk = 28
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        if (keystorePropsFile.exists()) {
            create("release") {
                storeFile = file(keystoreProp("storeFile"))
                storePassword = keystoreProp("storePassword")
                keyAlias = keystoreProp("keyAlias")
                keyPassword = keystoreProp("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            if (keystorePropsFile.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
            optimization {
                enable = true
                packageScope = setOf("androidx.**", "kotlin.**", "kotlinx.**")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        compose = true
    }
}

// La PWA compilada vive en src/main/assets/www/ (ignorada en Git). Si falta, el APK saldría
// sin la app: se falla antes de empaquetar los assets, con un mensaje claro.
// Va enganchada a merge*Assets (no a preBuild) para que testDebugUnitTest no la necesite.
val checkPwaAssets = tasks.register("checkPwaAssets") {
    description = "Verifica que la PWA compilada esté en src/main/assets/www/."
    val indexHtml = layout.projectDirectory.file("src/main/assets/www/index.html")
    doLast {
        if (!indexHtml.asFile.exists()) {
            throw GradleException(
                "Falta la PWA en app/src/main/assets/www/. " +
                    "Desde la raíz del repo: pnpm build:android; pnpm copy:android"
            )
        }
    }
}
tasks.named { it.startsWith("merge") && it.endsWith("Assets") }.configureEach {
    dependsOn(checkPwaAssets)
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.health.connect.client)
    implementation(libs.androidx.webkit)
    testImplementation(libs.junit)
    testImplementation(libs.org.json)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}