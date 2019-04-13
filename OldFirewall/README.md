# Office365-IPURL-Samples
Sample code for connecting with the Office 365 IP Address and URL web services

 Generate-OldFirewall-XML.ps1
This sample is for customers who have a dependency on one of the old XML downloads that was provided for Office 365. Notification was provided on 4/2/2018 that these would be deprecated and the files are no longer updated since 10/2/2018. There is a new JSON format output available with additional attributes from a web service as documented at http://aka.ms/ipurlblog.

The script calls the new IP/URL web service passing in a parameter for the service instance requested and outputs the data in XML format similar to the previous downloads. The acceptable service instances are:
* Worldwide
* USGovDoD
* USGovGCCHigh
* China
* Germany

Compared to the old XML file, the product names will be different. THe new product names included are:
* Exchange
* SharePoint
* Skype
* Common

We have some recommended migration approaches detailed here: https://techcommunity.microsoft.com/t5/Office-365-Networking/Migrating-to-the-new-web-services-based-publishing-for-Office/m-p/229144 
