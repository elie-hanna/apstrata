package com.elementn.android.testapp;

import android.os.Bundle;
import android.preference.PreferenceActivity;
import com.elementn.android.testapp.R;

public class MyPreferencesActivity extends PreferenceActivity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    addPreferencesFromResource(R.xml.preferences);
	}

}
