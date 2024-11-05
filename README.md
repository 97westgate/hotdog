# HotDog or Not HotDog

A web app that captures an image from your camera to identify whether it's a hot dog or... not a hot dog! Powered by Google Cloud Vision API for image analysis.

Live Demo: [hotdog-one-psi.vercel.app](https://hotdog-one-psi.vercel.app)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [To-Do List](#to-do-list)
- [Resources](#resources)

## Overview

> *"What would you say if I told you there is an app on the market that tells you if you have a hotdog or not a hotdog. It is very good and I do not want to work on it any more. You can hire someone else."*

This web app utilizes the device’s camera to capture an image and analyze it using Google Cloud Vision API, determining if the object in view is a hot dog. If identified as a hot dog, a green banner appears, and if not, a red banner displays. Simple and interactive, this app provides a quick way to test out Google Cloud Vision’s image recognition capabilities in a fun context.

## Features

- **Live Camera Capture**: Instantly captures the view from your camera.
- **Image Analysis**: Google Cloud Vision API analyzes each capture to identify hot dog-related elements.
- **Feedback**: Lets you know if hot dog through banner.
- **User Interaction**: Switch between cameras (when available).


### Prerequisites

- **Google Cloud Vision API Key** (you'll need to create a project on Google Cloud Platform and enable the Vision API)


## To-Do List

- [ ] Keep the captured image on the screen after capture
- [ ] Refactor code to remove old syntax like `.then` chains and improve readability with async/await
- [ ] Add a buffering/loading animation during image analysis
- [ ] Remove console logs and unnecessary comments
- [ ] Allow restarting to video stream by clicking anywhere on the screen when Not Hot dog covers shutter button
- [ ] Hide the camera switch button if 'user' facing-mode is unavailable
- [ ] Style the camera switch button to resemble the UI in the OG app

## Resources

- **[Building a Camera App on the Web](https://www.freecodecamp.org/news/build-a-camera-app-on-the-web/)** - A guide to capturing images with JavaScript
- **[Google Cloud Vision API](https://cloud.google.com/vision)** - Documentation for Google’s powerful image analysis API
- **[YouTube: Camera App Tutorial](https://www.youtube.com/watch?v=tWwCK95X6go)** - Video tutorial on building a web camera app
