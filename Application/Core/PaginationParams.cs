namespace Application.Core;

public class PaginationParams<TCursoe>
{
    private const int MaxPageSize = 50;
    public TCursoe? Cursor { get; set; }
    private int _pageSize = 3;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Min(value, MaxPageSize);
    }
}
