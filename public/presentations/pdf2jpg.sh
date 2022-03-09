#!/bin/bash
 
# Script to convert PDF file to JPG images
#
# Dependencies:
# * pdftk
# * imagemagick
#
# Does not work if the file input does not end with .pdf
# Modified by Mike DeMille to not create a directory, because the endpoint /media/addMedia is taking care of that
# and to keep a "master" copy of the PDF in the directory

PDF="$1"
FILE=`basename "$1"`
DIR=`echo "$PDF" | sed s:/"$FILE"::`

if [ -f "$PDF" ]; then # If the file exists
		
	if [ -d "$DIR" ]; then # If the directory exists
		echo "Processing $PDF"
		 
		echo '  Splitting PDF file to PDF pages...'
		pdftk "$PDF" burst output "$DIR"/%d.pdf
		
		rm "doc_data.txt"
		 
		echo '  Converting PDF pages to JPEG files...'
		for i in "$DIR"/*.pdf; do
			if [ "$PDF" != "$i" ]; then # Don't touch the master PDF
				echo -e "  $i"
				convert -colorspace RGB -interlace none -density 300x300 -quality 100 "$i" "$DIR"/`basename "$i" .pdf`.jpg
			fi
		done
		 
		echo '  Deleting PDF pages...'
		for i in "$DIR"/*.pdf; do
			if [ "$PDF" != "$i" ]; then # Don't touch the master PDF
				echo -e "  $i"
				rm "$i"
			fi
		done

		echo 'All done!'
	fi
else
	echo "PDF '$PDF' could not be located"
fi	 
