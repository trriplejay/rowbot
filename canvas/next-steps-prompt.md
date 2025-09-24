the next tricky part to implement is making the image dynamic based on input from the user. Here are some step by step instructions for implementing this feature. I copied forestGenerate.ts to finalGenerate.ts. from now on canvas/finalGenerate.ts will be the main file that we make all changes to for this feature.

1. Lets remove the final column labeled "BPM". this data isn't really necessary and it's more complicated to retrieve. Please remove the column and make the overall image more narrow.
2. this functionality should be put inside a method. When some external file calls this method, it returns the buffer as a result. it doesnt not write the image directly itself.
3. The top line that says "training_data.exe" should be changed to have a username in front. This name will be supplied as an argument to the method. For example for a username "foo" the top row should sayd "FOO TRAINING_DATA" (remove the .exe as well, and make the username all caps to fit the theme)
4. The method should also accept a "LogbookResult" object type which can be found in logbook/client.ts. The rest of the data for the table will be found inside this object.
5. The first row in the table comes from the data in the LogbookResult object.
6. every row beyond the first in the table is optional. Check the LogbookResult workout section for an array of "intervals" or an array of "splits". Each item in these arrays corresponds to a row in the table. "intervals" and "splits" will never coexist, so if "splits" are present, you can skip checking for intervals.
7. there could be as many as 50 rows in the table, so we need to make sure that the height of the overall image is adjusted based on the number of rows, so has an appropriate height for the amount of data it contains.
