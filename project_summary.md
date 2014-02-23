# Face Cloud

## Authors
Robert Woodley and Adelheid Mers   
[http://github.com/rwoodley]  

## Description

According to neurologist Semir Zeki, artists have preferred modes of cognition that direct production. What can we learn from an obsession with observing faces on a train commute? This daily dérive of morphologies  - bracketing color or expressions - sparked our project. 

An interactive installation, Face Cloud presents an infinite field of haunting, unique, artificial faces that are  generated from a hidden research database of scanned real faces. Users may scan their own faces to be added to that database - the vault. The diversity, nuance and complexity of the Face Cloud that draws from it visibly increases with each entry. 

Spanning 60 dimensions, the cloud is produced by subverting standard face recognition algorithms.

This project reverses face detection and recognition narratives. Instead of singling out, it joins. By suggesting ways of parsing and projecting the visible world, it is epistemic.

## Link to Prototype
http://facefield.org/SynthFace.aspx
   
## Example Code
The key code which underlies our whole project concerns the ability to create faces by combining the 60 eigen faces in various combinations. From our first post, a new routine that we added to OpenCV to allow just that:
```
Mat Eigenfaces::reconstructFromCoordinates(InputArray coordinates) const {   
    Mat projection = coordinates.getMat();   
    // slice the eigenvectors from the model   
    Mat evs = Mat(_eigenvectors, Range::all(), Range(0, _num_components));  
    // do a subspace projection of the given coords, this will create our face. 
    Mat reconstruction = subspaceReconstruct(evs, _mean, projection);   
    return reconstruction.reshape(1,_faceRows);   
}   

```


## Links to External Libraries

http://code.opencv.org/projects/opencv/wiki


