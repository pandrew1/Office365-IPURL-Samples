#
# Script loads Office 365 endpoints from web service, orders them according to the XML schema, and outputs a file
# 4 September 2018
#
# Copyright Microsoft 2018
#

# Set parameters for the script
$wsRoot = "https://endpoints.office.com"
$clientRequestId = "b10c5ed1-bad1-445f-b386-b919946339a7"
$instanceName = "Worldwide"
$outfilePath = "O365IPAddresses_$instanceName.xml"

# Get latest endpoints data from the web service
$e = Invoke-RestMethod -Uri ("$($wsRoot)/endpoints/$($instanceName)?clientrequestid=$($clientRequestId)")

# Structure attributes and split IPv4 and IPv6
$canon = $e | ForEach-Object {
    $ipv4 = @()
    $ipv6 = @()
    
    if ("ips" -in $_.PSobject.properties.name) {
        $ipv4 = $_.ips | Where-Object {$_ -like '*.*'}  
        $ipv6 = $_.ips | Where-Object {$_ -like '*:*'}  
    }

    [PSCustomObject]@{ 
        id           = $_.id;
        product      = $_.serviceArea;
        ipv4         = $ipv4;
        ipv6         = $ipv6;
        urls         = $_.urls;
    }
}

# Order of the workload keys in the published XML
$workloadKeysOrdered = @("Exchange","SharePoint","Skype","Common")

# Helper func to sort IPs numerically
$sortIPFunc = {
    $byteArray = [System.Net.IPAddress]::Parse($_.Split('/')[0]).GetAddressBytes()
    [System.Array]::Reverse($byteArray)
    if ($byteArray.Count -eq 16) {
        # IPv6 - convert to 4-element 32-bit int array and then to string
        (@(12, 8, 4, 0) | foreach { '{0:x8}' -f [System.BitConverter]::ToUInt32($byteArray, $_) }) -join ""
    }
    else {
        # IPv4 - converting to 32-bit int is sufficient
        [System.BitConverter]::ToUInt32($byteArray, 0)
    }
}

# Output XML
$xml = "<?xml version=`"1.0`" encoding=`"utf-8`"?>`r`n"
$xml += "<products updated=`"1/1/1900`">`r`n"
$xml += $(($workloadKeysOrdered | foreach {
    $workloadName = $_
    $mergeObject = $canon | where { $_.product -eq $workloadName } 

    "  <product name=`"$workloadName`">`r`n" + 

    # IPv6
    $(if ($mergeObject.ipv6.Length -gt 0) {
        "    <addresslist type=`"IPv6`">`r`n" +
        $(($mergeObject.ipv6 | Sort -Unique -Property $sortIPFunc | ForEach-Object {
            "      <address>$_</address>`r`n"
        }) -join "") +
        "    </addresslist>`r`n"
    } else { "" }) +

    # IPv4
    $(if ($mergeObject.ipv4.Length -gt 0) {
        "    <addresslist type=`"IPv4`">`r`n" +
        $(($mergeObject.ipv4 | Sort -Unique -Property $sortIPFunc | ForEach-Object {
                    "      <address>$_</address>`r`n"
        }) -join "") +
        "    </addresslist>`r`n"
    } else { "" }) +

    # URL
    $(if ($mergeObject.urls.Length -gt 0) {
        "    <addresslist type=`"URL`">`r`n" +
        $(($mergeObject.urls | Sort -Unique | ForEach-Object {
                    "      <address>$_</address>`r`n"
        }) -join "") +
        "    </addresslist>`r`n"
    } else { "" }) +

    "  </product>"

}) -join "`r`n")
$xml += '</products>'

$xml | Out-File $outfilePath
