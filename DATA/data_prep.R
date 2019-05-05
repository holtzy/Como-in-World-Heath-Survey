# ----------
# A script that takes data from Carmen and transform it for the web application
# ----------

library(tidyverse)
setwd("~/Desktop/Como-in-World-Heath-Survey/DATA")


# ----------
# Load data + General changes necessary for all charts
# ----------

# Load data
data <- read.table("COMO_W_longformat_Yan_02Apr19.csv", header=T, sep=",")

# Change colnames
colnames(data)[1:2] <- c("Prior_disorder", "Later_disorder")

# Replace IED by Intermittent explosive disorder
data <- data %>% mutate(Later_disorder = gsub("IED", "Intermittent explosive disorder", Later_disorder))

# Upper case in specific phobia..
data <- data %>% mutate(Later_disorder = gsub("Specific Phobia", "Specific phobia", Later_disorder))

# List of Prior and Later disorder:
levels(data$Prior_disorder) #24
unique(data$Later_disorder) #25





# ----------
# Preparation for dotplot histogram
# ----------

# Compute position for dotplot histogram
bin <- 1
don <- data %>%
  filter(Model == "A" & Sex == "All") %>%
  arrange(HR) %>%
  mutate(HR_rounded = round(HR/bin)*bin ) %>%
  mutate(y=ave(HR_rounded, HR_rounded, FUN=seq_along)) %>%
  filter(!is.na(HR))

# Write result at a .js object
tosave <- paste("dataHistogram = ", toJSON(don))
fileConn<-file("dataHistogram.js")
writeLines(tosave, fileConn)
close(fileConn)










# ----------
# Preparation for Sankey plot
# ----------

# Add space to outcome to make it different
tmp <- data %>% mutate( Later_disorder = paste( Later_disorder, " ", sep=""))

# Save it
write.table(tmp, file="data_sankey.csv", quote=F, row.names=F, sep=",")

# Make a data frame with nodes
#nodes = data.frame( ID = c(as.character(unique(tmp$Prior_disorder)), as.character(unique(tmp$Later_disorder)) ) ) %>%

# Make a data frame with the links
#tmp$from <- match(tmp$Prior_disorder, nodes$ID)-1
#tmp$to <- match(tmp$Later_disorder, nodes$ID)-1
# Export to JSON






# ----------
# Preparation for symmetry chart
# ----------

# Read data
data <- read.table("data.csv", header=T, sep=",")

# Watch an example
couple = c("Alcohol dependence", "Drug dependence")
data %>% filter(Later_disorder %in% couple & Prior_disorder %in% couple)

# Merge with opposite direction
tmp <- merge(data, data, by.x=c("Prior_disorder", "Later_disorder"), by.y=c("Later_disorder", "Prior_disorder")) %>%
  mutate(coefVar = (HR.y - HR.x) / max(c(HR.y, HR.x)) * 100)
tmp %>% filter(Later_disorder %in% couple & Prior_disorder %in% couple)

# Clean
dataReady <- tmp %>% select(-7, -8, -9, -10)
colnames(dataReady) <- c(colnames(data), "coefvar")
dataReady %>% head()

# Highest one?
dataReady %>% arrange(coefvar) %>% head()
dataReady %>% arrange(coefvar) %>% tail()

# Export
write.table(dataReady, file="data_bar.csv", quote=F, row.names=F, sep=",")



