package com.be.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class PagingUtil {
    public static int DEFAULT_PAGE_SIZE = 16;
    public static int DEFAULT_PAGE_NUMBER = 1;

    public int getPage(int page) {
        return Math.max(page, DEFAULT_PAGE_NUMBER);
    }

    public int getPageSize(int size) {
        return Math.min(size, DEFAULT_PAGE_SIZE);
    }

    public int getOffset(int page, int offset) {
        return (page - 1) * DEFAULT_PAGE_SIZE;
    }
}
